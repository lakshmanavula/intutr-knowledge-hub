import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Subscription, SubscriptionStatus, PaymentMethod } from '@/types/api';

interface SubscriptionDetailProps {
  subscription: Subscription;
}

export function SubscriptionDetail({ subscription }: SubscriptionDetailProps) {
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
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription className="mt-2">
                Subscription for {subscription.userName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(subscription.status)}
              {getPaymentMethodBadge(subscription.paymentMethod)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Amount</h4>
              <p className="text-lg font-semibold">
                {formatCurrency(subscription.amount, subscription.currency)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Auto Renewal</h4>
              <p>{subscription.autoRenewal ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Start Date</h4>
              <p>{formatDate(subscription.startDate)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">End Date</h4>
              <p>{formatDate(subscription.endDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Name</h4>
              <p>{subscription.userName}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
              <p className="font-mono text-sm">{subscription.userEmail}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">User ID</h4>
              <p className="font-mono text-sm">{subscription.userId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Product Name</h4>
              <p>{subscription.productName}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Product Type</h4>
              <p>{subscription.productType}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Product ID</h4>
              <p className="font-mono text-sm">{subscription.productId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Platform Subscription ID</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {subscription.platformSubscriptionId || 'Not configured'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Stripe Subscription ID</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {subscription.stripeSubscriptionId || 'Not configured'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Razorpay Subscription ID</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {subscription.razorpaySubscriptionId || 'Not configured'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Created</h4>
              <div className="space-y-1">
                <p className="text-sm">{formatDate(subscription.createdDate)}</p>
                <p className="text-sm text-muted-foreground">by {subscription.createdByName}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Last Modified</h4>
              <div className="space-y-1">
                <p className="text-sm">{formatDate(subscription.modifiedDate)}</p>
                <p className="text-sm text-muted-foreground">by {subscription.modifiedByName}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Subscription ID</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">{subscription.id}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
              <p className="text-sm">
                {subscription.deleted ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : (
                  getStatusBadge(subscription.status)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}