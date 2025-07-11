import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { couponApi, courseApi } from "@/services/api";
import type { Coupon, CreateCouponRequest, UpdateCouponRequest } from "@/types/api";

const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(20, "Code must be 20 characters or less"),
  description: z.string().min(1, "Description is required"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  minimumAmount: z.number().min(0, "Minimum amount must be positive"),
  maximumDiscount: z.number().min(0, "Maximum discount must be positive"),
  usageLimit: z.number().min(0, "Usage limit must be positive"),
  validFrom: z.date({ required_error: "Valid from date is required" }),
  validTo: z.date({ required_error: "Valid to date is required" }),
  isActive: z.boolean(),
  applicableToAllCourses: z.boolean(),
  applicableCourseIds: z.array(z.string()),
}).refine((data) => data.validTo > data.validFrom, {
  message: "Valid to date must be after valid from date",
  path: ["validTo"],
}).refine((data) => {
  if (data.discountType === "PERCENTAGE") {
    return data.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  coupon?: Coupon | null;
  onClose: () => void;
}

export function CouponForm({ coupon, onClose }: CouponFormProps) {
  const [showCourseSelection, setShowCourseSelection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses for selection
  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseApi.getAll(0, 100),
  });

  const courses = coursesData?.content || [];

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minimumAmount: 0,
      maximumDiscount: 0,
      usageLimit: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      applicableToAllCourses: true,
      applicableCourseIds: [],
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumAmount: coupon.minimumAmount,
        maximumDiscount: coupon.maximumDiscount,
        usageLimit: coupon.usageLimit,
        validFrom: new Date(coupon.validFrom),
        validTo: new Date(coupon.validTo),
        isActive: coupon.isActive,
        applicableToAllCourses: coupon.applicableToAllCourses,
        applicableCourseIds: coupon.applicableCourseIds,
      });
      setShowCourseSelection(!coupon.applicableToAllCourses);
    }
  }, [coupon, form]);

  // Watch for changes in applicableToAllCourses
  const applicableToAllCourses = form.watch("applicableToAllCourses");
  const discountType = form.watch("discountType");

  useEffect(() => {
    setShowCourseSelection(!applicableToAllCourses);
    if (applicableToAllCourses) {
      form.setValue("applicableCourseIds", []);
    }
  }, [applicableToAllCourses, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCouponRequest) => couponApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponRequest }) =>
      couponApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CouponFormData) => {
    const formData = {
      code: data.code,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minimumAmount: data.minimumAmount,
      maximumDiscount: data.maximumDiscount,
      usageLimit: data.usageLimit,
      validFrom: data.validFrom.toISOString(),
      validTo: data.validTo.toISOString(),
      isActive: data.isActive,
      applicableToAllCourses: data.applicableToAllCourses,
      applicableCourseIds: data.applicableCourseIds,
    };

    if (coupon) {
      updateMutation.mutate({ id: coupon.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    const currentIds = form.getValues("applicableCourseIds");
    if (checked) {
      form.setValue("applicableCourseIds", [...currentIds, courseId]);
    } else {
      form.setValue("applicableCourseIds", currentIds.filter(id => id !== courseId));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SAVE20"
                        className="font-mono uppercase"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
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
                    <Textarea
                      placeholder="Describe what this coupon is for..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Discount Value {discountType === "PERCENTAGE" ? "(%)" : "($)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max={discountType === "PERCENTAGE" ? "100" : undefined}
                        step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum order amount to use this coupon
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Discount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum discount amount (for percentage coupons)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid To</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0 for unlimited"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    How many times this coupon can be used (0 for unlimited)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="applicableToAllCourses"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Apply to All Courses
                      </FormLabel>
                      <FormDescription>
                        This coupon can be used for any course
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {showCourseSelection && (
                <FormField
                  control={form.control}
                  name="applicableCourseIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Applicable Courses</FormLabel>
                      <FormDescription>
                        Select which courses this coupon can be applied to
                      </FormDescription>
                      <ScrollArea className="h-40 w-full rounded-md border p-4">
                        <div className="space-y-2">
                          {courses.map((course) => (
                            <div key={course.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={course.id}
                                checked={form.watch("applicableCourseIds").includes(course.id)}
                                onCheckedChange={(checked) => 
                                  handleCourseToggle(course.id, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={course.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {course.name}
                                <Badge variant="secondary" className="ml-2">
                                  {course.categoryName}
                                </Badge>
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Whether this coupon is currently active and can be used
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {coupon ? "Update" : "Create"} Coupon
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}