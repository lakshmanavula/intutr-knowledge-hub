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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { productApi } from '@/services/api';
import { Product, ProductType, ProductStatus } from '@/types/api';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.nativeEnum(ProductType),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().min(1, 'Currency is required'),
  durationDays: z.number().optional(),
  associatedCourseIds: z.string().optional(),
  platformProductIdGoogle: z.string().optional(),
  platformProductIdApple: z.string().optional(),
  stripePriceId: z.string().optional(),
  razorpayPlanId: z.string().optional(),
  razorpayProductId: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      type: product?.type || ProductType.SUBSCRIPTION,
      price: product?.price || 0,
      currency: product?.currency || 'USD',
      durationDays: product?.durationDays || undefined,
      associatedCourseIds: product?.associatedCourseIds?.join(',') || '',
      platformProductIdGoogle: product?.platformProductIdGoogle || '',
      platformProductIdApple: product?.platformProductIdApple || '',
      stripePriceId: product?.stripePriceId || '',
      razorpayPlanId: product?.razorpayPlanId || '',
      razorpayProductId: product?.razorpayProductId || '',
      status: product?.status || ProductStatus.ACTIVE,
    },
  });

  const createMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product created successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product updated successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    const formData = {
      name: values.name,
      description: values.description,
      type: values.type,
      price: values.price,
      currency: values.currency,
      status: values.status,
      ...(values.durationDays && { durationDays: values.durationDays }),
      associatedCourseIds: values.associatedCourseIds
        ? values.associatedCourseIds.split(',').map(id => id.trim()).filter(Boolean)
        : [],
      ...(values.platformProductIdGoogle && { platformProductIdGoogle: values.platformProductIdGoogle }),
      ...(values.platformProductIdApple && { platformProductIdApple: values.platformProductIdApple }),
      ...(values.stripePriceId && { stripePriceId: values.stripePriceId }),
      ...(values.razorpayPlanId && { razorpayPlanId: values.razorpayPlanId }),
      ...(values.razorpayProductId && { razorpayProductId: values.razorpayProductId }),
    };

    if (product) {
      updateMutation.mutate({ id: product.id, data: formData });
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ProductType.SUBSCRIPTION}>Subscription</SelectItem>
                    <SelectItem value={ProductType.ONE_TIME}>One Time</SelectItem>
                  </SelectContent>
                </Select>
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
                <Textarea placeholder="Product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
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

          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="30" 
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty for unlimited duration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={ProductStatus.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="associatedCourseIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Course IDs</FormLabel>
              <FormControl>
                <Input placeholder="course-id-1, course-id-2" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of course IDs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="platformProductIdGoogle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Product ID</FormLabel>
                <FormControl>
                  <Input placeholder="com.example.product" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platformProductIdApple"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apple Product ID</FormLabel>
                <FormControl>
                  <Input placeholder="com.example.product" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="stripePriceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe Price ID</FormLabel>
                <FormControl>
                  <Input placeholder="price_xxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="razorpayPlanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razorpay Plan ID</FormLabel>
                <FormControl>
                  <Input placeholder="plan_xxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="razorpayProductId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razorpay Product ID</FormLabel>
                <FormControl>
                  <Input placeholder="prod_xxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}