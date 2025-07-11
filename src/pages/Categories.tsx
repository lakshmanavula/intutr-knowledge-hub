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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { courseCategoryApi } from "@/services/api";
import type { CourseCategory } from "@/types/api";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default function Categories() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CourseCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await courseCategoryApi.getPaginated(currentPage, 10);
      setCategories(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCategories();
      return;
    }

    try {
      setLoading(true);
      const response = await courseCategoryApi.search({
        categoryName: searchTerm,
        page: 0,
        size: 10,
      });
      setCategories(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: CourseCategory) => {
    try {
      await courseCategoryApi.delete(category.id);
      toast({
        title: "Success",
        description: `Category "${category.categoryName}" deleted successfully.`,
      });
      fetchCategories();
      setDeleteCategory(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete category. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;

    try {
      await courseCategoryApi.bulkDelete(selectedCategories);
      toast({
        title: "Success",
        description: `${selectedCategories.length} categories deleted successfully.`,
      });
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (category: CourseCategory) => {
    try {
      await courseCategoryApi.toggleActive(category.id);
      toast({
        title: "Success",
        description: `Category "${category.categoryName}" ${category.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === (categories || []).length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((categories || []).map(cat => cat.id));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/course-categories/download-excel', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'course-categories.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Categories exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/course-categories/bulk-upload-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      toast({
        title: "Success",
        description: "Categories imported successfully.",
      });
      
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import categories. Please try again.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredCategories = (categories || []).filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showCreateForm) {
    return (
      <CategoryForm
        onSuccess={() => {
          setShowCreateForm(false);
          fetchCategories();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingCategory) {
    return (
      <CategoryForm
        category={editingCategory}
        onSuccess={() => {
          setEditingCategory(null);
          fetchCategories();
        }}
        onCancel={() => setEditingCategory(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Categories</h1>
          <p className="text-muted-foreground">
            Manage your course categories and organization structure.
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
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">
              All course categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {(categories || []).filter(cat => cat.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {(categories || []).filter(cat => !cat.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Categories selected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                fetchCategories();
              }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedCategories.length} categories selected
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
                onClick={() => setSelectedCategories([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedCategories.length === (categories || []).length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectCategory(category.id)}
                      >
                        {selectedCategories.includes(category.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.categoryName}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{category.createdByName}</TableCell>
                    <TableCell>
                      {new Date(category.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteCategory(category)}
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

          {!loading && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found.</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, totalElements)} of {totalElements} categories
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              "{deleteCategory?.categoryName}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategory && handleDelete(deleteCategory)}
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