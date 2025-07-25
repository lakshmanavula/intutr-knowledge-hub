import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { transactionApi, userProfileApi, productApi } from "@/services/api";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@/types/api";

const createTransactionSchema = z.object({
  userId: z.string().min(1, "User is required"),
  subscriptionId: z.string().optional(),
  productId: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionReference: z.string().optional(),
  stripeTransactionId: z.string().optional(),
  razorpayTransactionId: z.string().optional(),
  description: z.string().optional(),
});

const updateTransactionSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  transactionReference: z.string().optional(),
  stripeTransactionId: z.string().optional(),
  razorpayTransactionId: z.string().optional(),
  description: z.string().optional(),
  failureReason: z.string().optional(),
});

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const isEdit = !!transaction;
  const schema = isEdit ? updateTransactionSchema : createTransactionSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: transaction
      ? {
          status: transaction.status,
          transactionReference: transaction.transactionReference || "",
          stripeTransactionId: transaction.stripeTransactionId || "",
          razorpayTransactionId: transaction.razorpayTransactionId || "",
          description: transaction.description || "",
          failureReason: transaction.failureReason || "",
        }
      : {
          userId: "",
          type: TransactionType.PAYMENT,
          amount: 0,
          currency: "USD",
          paymentMethod: PaymentMethod.STRIPE,
          description: "",
        },
  });

  const { data: users } = useQuery({
    queryKey: ["users-for-transaction"],
    queryFn: () => userProfileApi.search({ size: 100 }),
    enabled: !isEdit,
  });

  const { data: products } = useQuery({
    queryKey: ["products-for-transaction"],
    queryFn: () => productApi.search({ size: 100 }),
    enabled: !isEdit,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionApi.create(data),
    onSuccess: () => {
      toast.success("Transaction created successfully");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to create transaction");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTransactionRequest) =>
      transactionApi.update(transaction!.id, data),
    onSuccess: () => {
      toast.success("Transaction updated successfully");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to update transaction");
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (isEdit) {
      updateMutation.mutate(data as UpdateTransactionRequest);
    } else {
      createMutation.mutate(data as CreateTransactionRequest);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEdit && (
          <>
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.content.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.content.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TransactionType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="USD" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PaymentMethod).map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {isEdit && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TransactionStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="transactionReference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Reference</FormLabel>
              <FormControl>
                <Input {...field} placeholder="External transaction reference" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stripeTransactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe Transaction ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Stripe transaction ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="razorpayTransactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razorpay Transaction ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Razorpay transaction ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Transaction description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEdit && (
          <FormField
            control={form.control}
            name="failureReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Failure Reason</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Reason for failure (if applicable)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="w-full"
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : isEdit
            ? "Update Transaction"
            : "Create Transaction"}
        </Button>
      </form>
    </Form>
  );
}