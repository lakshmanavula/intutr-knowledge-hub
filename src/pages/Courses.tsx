import { useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx';
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RotateCcw,
  CheckSquare,
  Square,
  Star,
  DollarSign,
  Clock,
  Tag,
  Image,
  BookOpen,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { courseApi, courseCategoryApi } from "@/services/api";
import type { Course, CourseCategory } from "@/types/api";
import { CourseForm } from "@/components/courses/CourseForm";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "CREATED", label: "Created" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [feesRange, setFeesRange] = useState([0, 1000]);
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [durationRange, setDurationRange] = useState([0, 365]);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getPaginated(currentPage, pageSize);
      setCourses(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch courses. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching courses:", error);
      // Set default values on error
      setCourses([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...');
      const response = await courseCategoryApi.getAll();
      console.log('📦 Categories response:', response);
      console.log('📋 Response type:', typeof response, 'Is array:', Array.isArray(response));
      
      // response is already an array of CourseCategory[], no need to access .data
      const activeCategories = Array.isArray(response) ? response.filter(cat => cat.isActive) : [];
      console.log('✅ Active categories:', activeCategories);
      setCategories(activeCategories);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [currentPage, pageSize]);

  const handleSearch = async () => {
    if (!searchTerm.trim() && selectedCategory === "all" && selectedStatus === "all") {
      fetchCourses();
      return;
    }

    try {
      setLoading(true);
      const searchCriteria: any = {
        page: 0,
        size: pageSize,
      };

      if (searchTerm.trim()) {
        searchCriteria.name = searchTerm;
      }
      if (selectedCategory !== "all") {
        searchCriteria.categoryId = selectedCategory;
      }
      if (selectedStatus !== "all") {
        searchCriteria.status = selectedStatus;
      }

      // Add range filters if they're not at default values
      if (feesRange[0] > 0 || feesRange[1] < 1000) {
        searchCriteria.minFees = feesRange[0];
        searchCriteria.maxFees = feesRange[1];
      }
      if (ratingRange[0] > 0 || ratingRange[1] < 5) {
        searchCriteria.minRating = ratingRange[0];
        searchCriteria.maxRating = ratingRange[1];
      }

      const response = await courseApi.search(searchCriteria);
      setCourses(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(0);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to search courses. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (course: Course) => {
    try {
      await courseApi.delete(course.id);
      toast({
        title: "Success",
        description: `Course "${course.name}" deleted successfully.`,
      });
      fetchCourses();
      setDeleteCourse(null);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete course. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) return;

    try {
      await courseApi.bulkDelete(selectedCourses);
      toast({
        title: "Success",
        description: `${selectedCourses.length} courses deleted successfully.`,
      });
      setSelectedCourses([]);
      fetchCourses();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete courses. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (course: Course, newStatus: Course['status']) => {
    try {
      await courseApi.updateStatus(course.id, newStatus);
      toast({
        title: "Success",
        description: `Course "${course.name}" status updated to ${newStatus}.`,
      });
      fetchCourses();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update course status. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === (courses || []).length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses((courses || []).map(course => course.id));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setFeesRange([0, 1000]);
    setRatingRange([0, 5]);
    setDurationRange([0, 365]);
    fetchCourses();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PUBLISHED: "default",
      DRAFT: "secondary", 
      CREATED: "outline",
      ARCHIVED: "destructive",
    } as const;
    
    const colors = {
      PUBLISHED: "bg-success text-success-foreground",
      DRAFT: "bg-warning text-warning-foreground",
      CREATED: "bg-muted text-muted-foreground",
      ARCHIVED: "bg-destructive text-destructive-foreground",
    } as const;
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-muted"}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? "fill-warning text-warning" : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  const handleExportExcel = () => {
    // Prepare data for export
    const exportData = courses.map(course => ({
      'Course Name': course.name,
      'Description': course.description,
      'Category': categories.find(cat => cat.id === course.categoryId)?.categoryName || 'N/A',
      'Status': course.status,
      'Fees': course.fees,
      'Rating': course.rating,
      'Duration (Days)': course.duration,
      'Created Date': new Date(course.createdDate).toLocaleDateString(),
      'Tags': course.tags || '',
      'Course Label': course.courseLabel,
      'Thumbnail': course.thumbnail,
      'Excel File Path': course.xlsxFilePath
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Courses');

    // Download file
    XLSX.writeFile(wb, `courses_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Success",
      description: "Courses exported successfully!",
    });
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Imported data:', jsonData);
        
        toast({
          title: "Success",
          description: `Successfully imported ${jsonData.length} rows from Excel file.`,
        });

        // Here you would typically process the imported data and save it to your backend
        // For now, we'll just log it and show a success message
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Error",
          description: "Failed to parse Excel file. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadKmapExcel = async (course: Course) => {
    try {
      const blob = await courseApi.downloadKmapExcel(course.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${course.name}_kmap_data.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `KMap data for "${course.name}" downloaded successfully!`,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to download KMap data. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleViewKmapTopics = async (course: Course) => {
    try {
      const topics = await courseApi.getKmapTopics(course.id);
      
      // Create a simple dialog/modal to show topics data
      const topicsText = JSON.stringify(topics, null, 2);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>KMap Topics - ${course.name}</title>
              <style>
                body { font-family: monospace; padding: 20px; }
                .header { font-size: 18px; margin-bottom: 20px; }
                .content { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="header">KMap Topics for: ${course.name}</div>
              <div class="content">${topicsText}</div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
      
      toast({
        title: "Success",
        description: `Found ${topics.length} KMap topics for "${course.name}".`,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch KMap topics. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (showCreateForm) {
    return (
      <CourseForm
        categories={categories}
        onSuccess={() => {
          setShowCreateForm(false);
          fetchCourses();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingCourse) {
    return (
      <CourseForm
        course={editingCourse}
        categories={categories}
        onSuccess={() => {
          setEditingCourse(null);
          fetchCourses();
        }}
        onCancel={() => setEditingCourse(null)}
        onRefresh={fetchCourses}
      />
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses, content, and student progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportExcel}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
          <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">All courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {(courses || []).filter(course => course.status === 'PUBLISHED').length}
            </div>
            <p className="text-xs text-muted-foreground">Live courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {(courses || []).filter(course => course.status === 'DRAFT').length}
            </div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses selected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main search and quick filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fees Range</label>
                  <Slider
                    value={feesRange}
                    onValueChange={setFeesRange}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${feesRange[0]}</span>
                    <span>${feesRange[1]}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating Range</label>
                  <Slider
                    value={ratingRange}
                    onValueChange={setRatingRange}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{ratingRange[0]} ⭐</span>
                    <span>{ratingRange[1]} ⭐</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (Days)</label>
                  <Slider
                    value={durationRange}
                    onValueChange={setDurationRange}
                    max={365}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{durationRange[0]} days</span>
                    <span>{durationRange[1]} days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {selectedCourses.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedCourses.length} courses selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCourses([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                      {selectedCourses.length === (courses || []).length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(courses || []).map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectCourse(course.id)}
                      >
                        {selectedCourses.includes(course.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <img
                              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop&crop=center"
                              alt="Course placeholder"
                              className="w-full h-full object-cover rounded-lg opacity-60"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {course.courseLabel}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-h-[20px]">
                        {course.categoryName ? (
                          <Badge variant="outline">{course.categoryName}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No category</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderStarRating(course.rating)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {formatCurrency(course.fees)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration} days
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell>{course.createdByName}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownloadKmapExcel(course)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download KMap Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewKmapTopics(course)}>
                            <List className="mr-2 h-4 w-4" />
                            View KMap Topics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {STATUS_OPTIONS.slice(1).map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              onClick={() => handleStatusChange(course, status.value as Course['status'])}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Mark as {status.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteCourse(course)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && (courses || []).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found.</p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalElements > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} courses
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(0);
              }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 0) setCurrentPage(prev => prev - 1);
                  }}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* First page */}
              {currentPage > 2 && (
                <>
                  <PaginationItem>
                    <PaginationLink 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(0);
                      }}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}
              
              {/* Current page and neighbors */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageIndex = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                if (pageIndex >= totalPages) return null;
                
                return (
                  <PaginationItem key={pageIndex}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageIndex);
                      }}
                      isActive={pageIndex === currentPage}
                    >
                      {pageIndex + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {/* Last page */}
              {currentPage < totalPages - 3 && (
                <>
                  {currentPage < totalPages - 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(totalPages - 1);
                      }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
                  }}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCourse} onOpenChange={() => setDeleteCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              "{deleteCourse?.name}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCourse && handleDelete(deleteCourse)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}