import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { courseTopicApi } from "@/services/api";
import type { CourseTopic, CreateCourseTopicRequest, UpdateCourseTopicRequest } from "@/types/api";

const topicSchema = z.object({
  topicName: z.string().min(1, "Topic name is required").max(200, "Topic name must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  orderIndex: z.number().min(0, "Order index must be 0 or greater"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  isActive: z.boolean(),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface CourseTopicFormProps {
  topic?: CourseTopic;
  courseId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CourseTopicForm({ topic, courseId, onSuccess, onCancel }: CourseTopicFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      topicName: topic?.topicName || "",
      description: topic?.description || "",
      orderIndex: topic?.orderIndex || 1,
      duration: topic?.duration || 60,
      isActive: topic?.isActive ?? true,
    },
  });

  const onSubmit = async (data: TopicFormData) => {
    try {
      setLoading(true);
      
      if (topic) {
        // Update existing topic
        const updateData: UpdateCourseTopicRequest = {
          topicName: data.topicName,
          description: data.description,
          courseId,
          orderIndex: data.orderIndex,
          duration: data.duration,
          isActive: data.isActive,
        };
        await courseTopicApi.update(topic.id, updateData);
        toast({
          title: "Success",
          description: "Topic updated successfully.",
        });
      } else {
        // Create new topic
        const createData: CreateCourseTopicRequest = {
          topicName: data.topicName,
          description: data.description,
          courseId,
          orderIndex: data.orderIndex,
          duration: data.duration,
          isActive: data.isActive,
        };
        await courseTopicApi.create(createData);
        toast({
          title: "Success",
          description: "Topic created successfully.",
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: topic ? "Failed to update topic. Please try again." : "Failed to create topic. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving topic:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {topic ? "Edit Topic" : "Create New Topic"}
          </h1>
          <p className="text-muted-foreground">
            {topic ? "Update topic information and settings." : "Add a new topic to the course."}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="topicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter topic name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Index *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Position of this topic in the course sequence
                      </FormDescription>
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
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter topic description"
                        rows={4}
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
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Estimated time to complete this topic
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Make this topic available to students
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
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : topic ? "Update Topic" : "Create Topic"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}