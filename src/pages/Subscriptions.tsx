import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Eye, Filter, CreditCard } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { subscriptionApi } from '@/services/api';
import { Subscription, SubscriptionStatus, PaymentMethod } from '@/types/api';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { SubscriptionDetail } from '@/components/subscriptions/SubscriptionDetail';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search parameters
  const searchParams = {
    ...(searchQuery && { userEmail: searchQuery }),
    ...(statusFilter && { status: statusFilter }),
    ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }),
  };

  // Fetch subscriptions
  const {
    data: subscriptionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscriptions', currentPage, pageSize, searchParams],
    queryFn: () => subscriptionApi.search(searchParams, currentPage, pageSize),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: subscriptionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Success',
        description: 'Subscription deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subscription.',
        variant: 'destructive',
      });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription.',
        variant: 'destructive',
      });
    },
  });

  const subscriptions = subscriptionsData?.content || [];
  const totalPages = subscriptionsData?.totalPages || 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value === 'all' ? '' : value);
    } else if (filterType === 'paymentMethod') {
      setPaymentMethodFilter(value === 'all' ? '' : value);
    }
    setCurrentPage(0);
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditDialogOpen(true);
  };

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDetailDialogOpen(true);
  };

  const handleDelete = (subscription: Subscription) => {
    deleteMutation.mutate(subscription.id);
  };

  const handleCancel = (subscription: Subscription) => {
    cancelMutation.mutate(subscription.id);
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const variants = {
      [SubscriptionStatus.ACTIVE]: 'default',
      [SubscriptionStatus.EXPIRED]: 'secondary',
      [SubscriptionStatus.CANCELLED]: 'destructive',
      [SubscriptionStatus.PENDING]: 'outline',
      [SubscriptionStatus.SUSPENDED]: 'secondary',
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const variants = {
      [PaymentMethod.STRIPE]: 'outline',
      [PaymentMethod.RAZORPAY]: 'outline',
      [PaymentMethod.GOOGLE_PAY]: 'outline',
      [PaymentMethod.APPLE_PAY]: 'outline',
      [PaymentMethod.MANUAL]: 'secondary',
    };
    return <Badge variant={variants[method] as any}>{method}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscriptions
              </CardTitle>
              <CardDescription>
                Manage user subscriptions and billing information.
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Subscription</DialogTitle>
                  <DialogDescription>
                    Add a new subscription for a user.
                  </DialogDescription>
                </DialogHeader>
                <SubscriptionForm onClose={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={SubscriptionStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={SubscriptionStatus.EXPIRED}>Expired</SelectItem>
                <SelectItem value={SubscriptionStatus.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={SubscriptionStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={SubscriptionStatus.SUSPENDED}>Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter || 'all'} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value={PaymentMethod.STRIPE}>Stripe</SelectItem>
                <SelectItem value={PaymentMethod.RAZORPAY}>Razorpay</SelectItem>
                <SelectItem value={PaymentMethod.GOOGLE_PAY}>Google Pay</SelectItem>
                <SelectItem value={PaymentMethod.APPLE_PAY}>Apple Pay</SelectItem>
                <SelectItem value={PaymentMethod.MANUAL}>Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions Table */}
          {isLoading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error loading subscriptions: {error.message}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.productType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>{getPaymentMethodBadge(subscription.paymentMethod)}</TableCell>
                      <TableCell>{formatDate(subscription.startDate)}</TableCell>
                      <TableCell>{formatDate(subscription.endDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(subscription)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subscription)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {subscription.status === SubscriptionStatus.ACTIVE && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(subscription)}
                              className="text-destructive hover:text-destructive"
                            >
                              Cancel
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this subscription for "{subscription.userName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(subscription)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(0, currentPage - 2) + i;
                        if (pageNumber >= totalPages) return null;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={pageNumber === currentPage}
                              className="cursor-pointer"
                            >
                              {pageNumber + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update the subscription information.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <SubscriptionForm
              subscription={selectedSubscription}
              onClose={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <SubscriptionDetail subscription={selectedSubscription} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscriptions;