import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { subscriptionApi } from '@/services/api';
import { Subscription, SubscriptionStatus, PaymentMethod } from '@/types/api';

const subscriptionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.nativeEnum(SubscriptionStatus),
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().min(1, 'Currency is required'),
  autoRenewal: z.boolean(),
  platformSubscriptionId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  razorpaySubscriptionId: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  subscription?: Subscription;
  onClose: () => void;
}

export function SubscriptionForm({ subscription, onClose }: SubscriptionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      userId: subscription?.userId || '',
      productId: subscription?.productId || '',
      startDate: subscription?.startDate ? subscription.startDate.split('T')[0] : '',
      endDate: subscription?.endDate ? subscription.endDate.split('T')[0] : '',
      status: subscription?.status || SubscriptionStatus.ACTIVE,
      paymentMethod: subscription?.paymentMethod || PaymentMethod.STRIPE,
      amount: subscription?.amount || 0,
      currency: subscription?.currency || 'USD',
      autoRenewal: subscription?.autoRenewal || false,
      platformSubscriptionId: subscription?.platformSubscriptionId || '',
      stripeSubscriptionId: subscription?.stripeSubscriptionId || '',
      razorpaySubscriptionId: subscription?.razorpaySubscriptionId || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: subscriptionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Success',
        description: 'Subscription created successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subscriptionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Success',
        description: 'Subscription updated successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: SubscriptionFormValues) => {
    const formData = {
      userId: values.userId,
      productId: values.productId,
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.status,
      paymentMethod: values.paymentMethod,
      amount: values.amount,
      currency: values.currency,
      autoRenewal: values.autoRenewal,
      ...(values.platformSubscriptionId && { platformSubscriptionId: values.platformSubscriptionId }),
      ...(values.stripeSubscriptionId && { stripeSubscriptionId: values.stripeSubscriptionId }),
      ...(values.razorpaySubscriptionId && { razorpaySubscriptionId: values.razorpaySubscriptionId }),
    };

    if (subscription) {
      updateMutation.mutate({ id: subscription.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SubscriptionStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={SubscriptionStatus.EXPIRED}>Expired</SelectItem>
                    <SelectItem value={SubscriptionStatus.CANCELLED}>Cancelled</SelectItem>
                    <SelectItem value={SubscriptionStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={SubscriptionStatus.SUSPENDED}>Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.STRIPE}>Stripe</SelectItem>
                    <SelectItem value={PaymentMethod.RAZORPAY}>Razorpay</SelectItem>
                    <SelectItem value={PaymentMethod.GOOGLE_PAY}>Google Pay</SelectItem>
                    <SelectItem value={PaymentMethod.APPLE_PAY}>Apple Pay</SelectItem>
                    <SelectItem value={PaymentMethod.MANUAL}>Manual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <Input placeholder="USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="autoRenewal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Auto Renewal</FormLabel>
                <FormDescription>
                  Enable automatic renewal for this subscription
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="platformSubscriptionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Subscription ID</FormLabel>
                <FormControl>
                  <Input placeholder="platform_sub_xxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stripeSubscriptionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe Subscription ID</FormLabel>
                <FormControl>
                  <Input placeholder="sub_xxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="razorpaySubscriptionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razorpay Subscription ID</FormLabel>
                <FormControl>
                  <Input placeholder="sub_xxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (subscription ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}