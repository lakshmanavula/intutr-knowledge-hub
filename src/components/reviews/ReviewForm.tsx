import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { reviewApi, courseApi, userApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Review, CreateReviewRequest } from "@/types/api";
import { Star } from "lucide-react";

const reviewFormSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  userId: z.string().min(1, "User is required"),
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  comment: z.string().min(1, "Comment is required").max(2000, "Comment must be less than 2000 characters"),
  isApproved: z.boolean(),
  isPublic: z.boolean(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  review?: Review | null;
  onClose: () => void;
}

export function ReviewForm({ review, onClose }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coursesData } = useQuery({
    queryKey: ["courses-for-review"],
    queryFn: () => courseApi.getAll(0, 100),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-for-review"],
    queryFn: () => userApi.getAll(0, 100),
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      courseId: "",
      userId: "",
      rating: 5,
      title: "",
      comment: "",
      isApproved: false,
      isPublic: true,
    },
  });

  useEffect(() => {
    if (review) {
      form.reset({
        courseId: review.courseId,
        userId: review.userId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isApproved: review.isApproved,
        isPublic: review.isPublic,
      });
    }
  }, [review, form]);

  const createMutation = useMutation({
    mutationFn: reviewApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "Review created successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to create review", variant: "destructive" });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reviewApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "Review updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update review", variant: "destructive" });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    setIsSubmitting(true);
    // Type assertion is safe here because form validation ensures all required fields are present
    const reviewData = data as CreateReviewRequest;
    if (review) {
      updateMutation.mutate({ id: review.id, data: reviewData });
    } else {
      createMutation.mutate(reviewData);
    }
  };

  const renderStarRating = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <Star 
              className={`h-6 w-6 ${
                i < value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-muted-foreground hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium">{value}/5</span>
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{review ? "Edit Review" : "Create New Review"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coursesData?.content?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
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
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersData?.content?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating *</FormLabel>
                  <FormControl>
                    <div>
                      {renderStarRating(field.value, field.onChange)}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter review title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Comment *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed review comment"
                      rows={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="isApproved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Approved</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Mark this review as approved for display
                      </div>
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

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this review visible to the public
                      </div>
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
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : review ? "Update Review" : "Create Review"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}