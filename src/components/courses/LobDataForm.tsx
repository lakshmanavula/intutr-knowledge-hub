import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { lobDataApi } from "@/services/api";
import type { LobData, CreateLobDataRequest, UpdateLobDataRequest } from "@/types/api";

const lobDataSchema = z.object({
  lobName: z.string().min(1, "Content name is required").max(200, "Content name must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  lobType: z.enum(["QUESTION", "EXPLANATION", "EXAMPLE", "EXERCISE"], {
    required_error: "Please select a content type",
  }),
  orderIndex: z.number().min(0, "Order index must be 0 or greater"),
  estimatedTimeMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    required_error: "Please select difficulty",
  }),
  isActive: z.boolean(),
});

type LobDataFormData = z.infer<typeof lobDataSchema>;

interface LobDataFormProps {
  lobData?: LobData;
  topicId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const LOB_TYPES = [
  { value: "QUESTION", label: "Question", description: "Learning questions" },
  { value: "EXPLANATION", label: "Explanation", description: "Detailed explanations" },
  { value: "EXAMPLE", label: "Example", description: "Examples and demonstrations" },
  { value: "EXERCISE", label: "Exercise", description: "Practice exercises" },
];

const DIFFICULTIES = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export function LobDataForm({ lobData, topicId, onSuccess, onCancel }: LobDataFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LobDataFormData>({
    resolver: zodResolver(lobDataSchema),
    defaultValues: {
      lobName: lobData?.lobName || "",
       content: lobData?.content || "",
       lobType: lobData?.lobType || "QUESTION",
       orderIndex: lobData?.orderIndex || 1,
       estimatedTimeMinutes: lobData?.estimatedTimeMinutes || 30,
       difficulty: lobData?.difficulty || "EASY",
      isActive: lobData?.isActive ?? true,
    },
  });

  const onSubmit = async (data: LobDataFormData) => {
    try {
      setLoading(true);
      
      if (lobData) {
        // Update existing lob data
         const updateData: UpdateLobDataRequest = {
           lobName: data.lobName,
           content: data.content,
           lobType: data.lobType,
           orderIndex: data.orderIndex,
           estimatedTimeMinutes: data.estimatedTimeMinutes,
           difficulty: data.difficulty,
           isActive: data.isActive,
           tags: [],
           metadata: {},
         };
        await lobDataApi.update(lobData.id, updateData);
        toast({
          title: "Success",
          description: "Content item updated successfully.",
        });
      } else {
        // Create new lob data
         const createData: CreateLobDataRequest = {
           topicId,
           lobName: data.lobName,
           content: data.content,
           lobType: data.lobType,
           orderIndex: data.orderIndex,
           estimatedTimeMinutes: data.estimatedTimeMinutes,
           difficulty: data.difficulty,
           isActive: data.isActive,
           tags: [],
           metadata: {},
         };
        await lobDataApi.create(createData);
        toast({
          title: "Success",
          description: "Content item created successfully.",
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: lobData ? "Failed to update content item. Please try again." : "Failed to create content item. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving lob data:", error);
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
            {lobData ? "Edit Content Item" : "Create New Content Item"}
          </h1>
          <p className="text-muted-foreground">
            {lobData ? "Update content item information and settings." : "Add a new content item to the topic."}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Content Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="lobName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter content name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOB_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col">
                                <span>{type.label}</span>
                                <span className="text-xs text-muted-foreground">{type.description}</span>
                              </div>
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
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter content text"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        Position in the topic sequence
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Estimated completion time
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIFFICULTIES.map((diff) => (
                            <SelectItem key={diff.value} value={diff.value}>
                              {diff.label}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Make this content available
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
                  {loading ? "Saving..." : lobData ? "Update Content" : "Create Content"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}