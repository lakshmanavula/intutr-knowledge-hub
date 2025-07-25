import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Product, ProductStatus, ProductType } from '@/types/api';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const getStatusBadge = (status: ProductStatus) => {
    const variant = status === ProductStatus.ACTIVE ? 'default' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getTypeBadge = (type: ProductType) => {
    const variant = type === ProductType.SUBSCRIPTION ? 'outline' : 'default';
    return <Badge variant={variant}>{type}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription className="mt-2">
                {product.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {getTypeBadge(product.type)}
              {getStatusBadge(product.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Price</h4>
              <p className="text-lg font-semibold">{product.currency} {product.price}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Duration</h4>
              <p>{product.durationDays ? `${product.durationDays} days` : 'Unlimited'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Mobile Platforms</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Google Play: </span>
                  <span className="text-sm text-muted-foreground">
                    {product.platformProductIdGoogle || 'Not configured'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">App Store: </span>
                  <span className="text-sm text-muted-foreground">
                    {product.platformProductIdApple || 'Not configured'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment Platforms</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Stripe Price ID: </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {product.stripePriceId || 'Not configured'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Razorpay Plan ID: </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {product.razorpayPlanId || 'Not configured'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Razorpay Product ID: </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {product.razorpayProductId || 'Not configured'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Associated Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Associated Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {product.associatedCourseIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.associatedCourseIds.map((courseId, index) => (
                <Badge key={index} variant="outline" className="font-mono">
                  {courseId}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No courses associated</p>
          )}
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
                <p className="text-sm">{formatDate(product.createdDate)}</p>
                <p className="text-sm text-muted-foreground">by {product.createdByName}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Last Modified</h4>
              <div className="space-y-1">
                <p className="text-sm">{formatDate(product.modifiedDate)}</p>
                <p className="text-sm text-muted-foreground">by {product.modifiedByName}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Product ID</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">{product.id}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
              <p className="text-sm">
                {product.deleted ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}