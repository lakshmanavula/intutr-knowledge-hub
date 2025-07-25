import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Transaction, TransactionType, TransactionStatus } from "@/types/api";

interface TransactionDetailProps {
  transaction: Transaction;
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const formatCurrency = (amount: number, currency?: string) => {
    // Validate currency code and use fallback
    const validCurrency = currency && typeof currency === 'string' && currency.length === 3 ? currency : "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: validCurrency,
    }).format(amount);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const variants: Record<TransactionStatus, "default" | "secondary" | "destructive" | "outline"> = {
      [TransactionStatus.PENDING]: "outline",
      [TransactionStatus.COMPLETED]: "default",
      [TransactionStatus.FAILED]: "destructive",
      [TransactionStatus.CANCELLED]: "secondary",
      [TransactionStatus.REFUNDED]: "secondary",
    };

    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: TransactionType) => {
    const variants: Record<TransactionType, "default" | "secondary" | "destructive" | "outline"> = {
      [TransactionType.PAYMENT]: "default",
      [TransactionType.REFUND]: "destructive",
      [TransactionType.SUBSCRIPTION]: "outline",
      [TransactionType.PURCHASE]: "secondary",
    };

    return (
      <Badge variant={variants[type]}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-sm">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              {getTypeBadge(transaction.type)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(transaction.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <Badge variant="outline">{transaction.paymentMethod}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{transaction.userName || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{transaction.userEmail || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-sm">{transaction.userId}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {(transaction.productId || transaction.subscriptionId) && (
        <Card>
          <CardHeader>
            <CardTitle>Related Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.productId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span>{transaction.productName || transaction.productId}</span>
              </div>
            )}
            {transaction.subscriptionId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscription ID:</span>
                <span className="font-mono text-sm">{transaction.subscriptionId}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transaction.transactionReference && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-mono text-sm">{transaction.transactionReference}</span>
            </div>
          )}
          {transaction.stripeTransactionId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stripe ID:</span>
              <span className="font-mono text-sm">{transaction.stripeTransactionId}</span>
            </div>
          )}
          {transaction.razorpayTransactionId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Razorpay ID:</span>
              <span className="font-mono text-sm">{transaction.razorpayTransactionId}</span>
            </div>
          )}
          {transaction.description && (
            <div>
              <div className="text-muted-foreground mb-2">Description:</div>
              <div className="bg-muted p-3 rounded-md">
                {transaction.description}
              </div>
            </div>
          )}
          {transaction.failureReason && (
            <div>
              <div className="text-muted-foreground mb-2">Failure Reason:</div>
              <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                {transaction.failureReason}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-muted-foreground">Created By:</div>
              <div>{transaction.createdByName}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(transaction.createdDate).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Modified By:</div>
              <div>{transaction.modifiedByName}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(transaction.modifiedDate).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}