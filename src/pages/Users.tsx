import { useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx';
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
  User,
  Users as UsersIcon,
  UserCheck,
  UserX,
  MapPin,
  Mail,
  Phone,
  Calendar,
  EyeOff,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { userProfileApi } from "@/services/api";
import type { UserProfile } from "@/types/api";
import { UserForm } from "@/components/users/UserForm";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users - page:', currentPage, 'size:', pageSize);
      const response = await userProfileApi.getPaginated(currentPage, pageSize);
      console.log('📡 User API response:', response);
      console.log('👥 Users content:', response.content);
      console.log('📊 Total elements:', response.totalElements);
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch users. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const handleSearch = async () => {
    if (!searchTerm.trim() && selectedStatus === "all" && selectedCountry === "all") {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const searchCriteria: any = {
        page: 0,
        size: pageSize,
      };

      if (searchTerm.trim()) {
        const nameParts = searchTerm.split(" ");
        if (nameParts.length > 1) {
          searchCriteria.firstName = nameParts[0];
          searchCriteria.lastName = nameParts.slice(1).join(" ");
        } else {
          searchCriteria.firstName = searchTerm;
        }
        // Also search by email
        searchCriteria.email = searchTerm;
      }
      
      if (selectedStatus !== "all") {
        searchCriteria.isActive = selectedStatus === "active";
      }
      
      if (selectedCountry !== "all") {
        searchCriteria.country = selectedCountry;
      }

      const response = await userProfileApi.search(searchCriteria);
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(0);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to search users. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    try {
      await userProfileApi.delete(user.id);
      toast({
        title: "Success",
        description: `User "${user.firstName} ${user.lastName}" deleted successfully.`,
      });
      fetchUsers();
      setDeleteUser(null);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete user. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await userProfileApi.bulkDelete(selectedUsers);
      toast({
        title: "Success",
        description: `${selectedUsers.length} users deleted successfully.`,
      });
      setSelectedUsers([]);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete users. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    try {
      await userProfileApi.toggleActive(user.id);
      toast({
        title: "Success",
        description: `User "${user.firstName} ${user.lastName}" ${user.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update user status. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === (users || []).length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers((users || []).map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedCountry("all");
    fetchUsers();
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    // Check if it's an age group (contains a dash)
    if (dateString.includes('-')) {
      return `Age group: ${dateString}`;
    }
    
    // Try to parse as date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if not a valid date
    }
    
    return date.toLocaleDateString();
  };

  // Get unique countries for filter
  const uniqueCountries = [...new Set((users || []).map(user => user.country))].filter(Boolean);

  const handleExportExcel = () => {
    // Prepare data for export
    const exportData = users.map(user => ({
      'First Name': user.firstName,
      'Last Name': user.lastName,
      'Email': user.email,
      'Phone': user.phoneNumber,
      'Country': user.country,
      'State': user.state,
      'City': user.city,
      'Address': user.address,
      'Postal Code': user.postalCode,
      'Date of Birth': user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '',
      'Gender': user.gender,
      'Status': user.isActive ? 'Active' : 'Inactive',
      'Created Date': new Date(user.createdDate).toLocaleDateString(),
      'Created By': user.createdBy
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Download file
    XLSX.writeFile(wb, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Success",
      description: "Users exported successfully!",
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

  if (showCreateForm) {
    return (
      <UserForm
        onSuccess={() => {
          setShowCreateForm(false);
          fetchUsers();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingUser) {
    return (
      <UserForm
        user={editingUser}
        onSuccess={() => {
          setEditingUser(null);
          fetchUsers();
        }}
        onCancel={() => setEditingUser(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts, profiles, and permissions.
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
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">All users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {(users || []).filter(user => user.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {(users || []).filter(user => !user.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Inactive accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedUsers.length}</div>
            <p className="text-xs text-muted-foreground">Users selected</p>
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
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {(uniqueCountries || []).map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
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

              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedUsers.length} users selected
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
                    onClick={() => setSelectedUsers([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
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
                      {selectedUsers.length === (users || []).length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users || []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectUser(user.id)}
                      >
                        {selectedUsers.includes(user.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback>
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1" />
                          {user.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{user.city}, {user.state}, {user.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                    <TableCell>{formatDate(user.createdDate)}</TableCell>
                    <TableCell>{user.createdByName}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                            {user.isActive ? (
                              <EyeOff className="mr-2 h-4 w-4" />
                            ) : (
                              <Eye className="mr-2 h-4 w-4" />
                            )}
                            {user.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteUser(user)}
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

          {!loading && (users || []).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found.</p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First User
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
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} users
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
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              "{deleteUser?.firstName} {deleteUser?.lastName}" and remove all their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUser && handleDelete(deleteUser)}
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