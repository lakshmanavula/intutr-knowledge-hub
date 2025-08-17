import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/services/api";
import type { Course, CourseCategory } from "@/types/api";

const courseSchema = z.object({
  name: z
    .string()
    .min(3, "Course name must be at least 3 characters")
    .max(100, "Course name must not exceed 100 characters"),
  courseLabel: z
    .string()
    .min(2, "Course label must be at least 2 characters")
    .max(50, "Course label must not exceed 50 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must not exceed 1000 characters"),
  fees: z
    .number()
    .min(0, "Fees must be a positive number")
    .max(10000, "Fees must not exceed $10,000"),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 day")
    .max(365, "Duration must not exceed 365 days"),
  thumbnail: z
    .string()
    .optional()
    .or(z.literal("")),
  status: z.enum(["CREATED", "PUBLISHED", "DRAFT", "ARCHIVED"]),
  xlsxFilePath: z
    .string()
    .optional()
    .or(z.literal("")),
  categoryId: z
    .string()
    .min(1, "Please select a category"),
  tags: z
    .string()
    .optional()
    .or(z.literal("")),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  categories: CourseCategory[];
  onSuccess: () => void;
  onCancel: () => void;
  onRefresh?: () => void;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", description: "Course is in development" },
  { value: "CREATED", label: "Created", description: "Course is ready for review" },
  { value: "PUBLISHED", label: "Published", description: "Course is live and available" },
  { value: "ARCHIVED", label: "Archived", description: "Course is no longer active" },
];

export function CourseForm({ course, categories, onSuccess, onCancel, onRefresh }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const selectedThumbnailFile = useRef<File | null>(null);
  const selectedExcelFile = useRef<File | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!course;

  console.log('🎯 CourseForm received categories:', categories);
  console.log('📊 Categories count:', categories?.length || 0);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: course?.name || "",
      courseLabel: course?.courseLabel || "",
      description: course?.description || "",
      fees: course?.fees || 0,
      duration: course?.duration || 30,
      thumbnail: course?.thumbnail || "",
      status: course?.status || "DRAFT",
      xlsxFilePath: course?.xlsxFilePath || "",
      categoryId: course?.categoryId || "",
      tags: course?.tags || "",
    },
  });

  // Reset form when course changes (for edit mode)
  useEffect(() => {
    if (course) {
      console.log('🔄 Resetting form with course data:', course);
      
      // Get current form values before reset
      const currentValues = form.getValues();
      
      form.reset({
        name: course.name || "",
        courseLabel: course.courseLabel || "",
        description: course.description || "",
        fees: course.fees || 0,
        duration: course.duration || 30,
        // Preserve uploaded thumbnail if it exists in form, otherwise use course data
        thumbnail: currentValues.thumbnail && currentValues.thumbnail.startsWith('http') 
          ? currentValues.thumbnail 
          : course.thumbnail || "",
        status: course.status || "DRAFT",
        // Preserve uploaded Excel file if it exists in form, otherwise use course data
        xlsxFilePath: currentValues.xlsxFilePath && currentValues.xlsxFilePath.startsWith('http')
          ? currentValues.xlsxFilePath
          : course.xlsxFilePath || "",
        categoryId: course.categoryId || "",
        tags: course.tags || "",
      });
    }
  }, [course, form]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsSubmitting(true);

      const requestData = {
        name: data.name,
        courseLabel: data.courseLabel,
        description: data.description,
        fees: data.fees,
        duration: data.duration,
        thumbnail: data.thumbnail || "",
        status: data.status,
        xlsxFilePath: data.xlsxFilePath || "",
        categoryId: data.categoryId,
        tags: data.tags || "",
      };

      let savedCourse;
      if (isEditing) {
        savedCourse = await courseApi.update(course.id, requestData);
      } else {
        savedCourse = await courseApi.create(requestData);
      }

      // Upload pending files for new courses
      if (!isEditing && savedCourse) {
        const courseId = savedCourse.id;
        
        // Upload thumbnail if selected
        if (selectedThumbnailFile.current) {
          try {
            const uploadResult = await courseApi.uploadThumbnail(courseId, selectedThumbnailFile.current);
            console.log('Thumbnail upload response:', uploadResult);
            
            // Update the course with the new thumbnail URL
            const thumbnailUrl = uploadResult.url;
            form.setValue('thumbnail', thumbnailUrl);
            savedCourse.thumbnail = thumbnailUrl;
            
            await courseApi.update(courseId, { ...savedCourse, thumbnail: thumbnailUrl });
          } catch (error) {
            console.error('Failed to upload thumbnail:', error);
            toast({
              title: "Upload Error",
              description: "Failed to upload thumbnail. Please try again.",
              variant: "destructive",
            });
          }
        }
        
        // Upload Excel file if selected
        if (selectedExcelFile.current) {
          try {
            const uploadResult = await courseApi.uploadKmapExcel(courseId, selectedExcelFile.current);
            console.log('Excel upload response:', uploadResult);
            
            // Update the course with the new Excel file URL
            const excelUrl = uploadResult.url;
            form.setValue('xlsxFilePath', excelUrl);
            savedCourse.xlsxFilePath = excelUrl;
            
            await courseApi.update(courseId, { ...savedCourse, xlsxFilePath: excelUrl });
          } catch (error) {
            console.error('Failed to upload Excel file:', error);
            toast({
              title: "Upload Error", 
              description: "Failed to upload Excel file. Please try again.",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: isEditing ? "Course updated successfully!" : "Course created successfully!",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? course?.name || "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? course?.description || "Update the course information below"
              : "Fill in the information below to create a new course"
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Duration</TabsTrigger>
                <TabsTrigger value="media">Media & Files</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Provide the core details about your course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Advanced React Development"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The full name of your course
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="courseLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Label</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., React Advanced"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Short label or code for the course
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.categoryName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the category that best fits this course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what students will learn in this course..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description of the course content and objectives
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., react,javascript,web-development"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated tags to help categorize and search for this course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing & Duration Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Duration</CardTitle>
                    <CardDescription>
                      Set the course pricing and duration details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Fees ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="299.99"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Course price in USD
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="30"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Expected course completion time in days
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media & Files Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Media & Files</CardTitle>
                    <CardDescription>
                      Upload course media and materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="thumbnail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail Image</FormLabel>
                          <FormControl>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                                      <Upload className="w-4 h-4 mr-2" />
                                      {course?.id ? 'Upload Image' : 'Select Image'}
                                    </div>
                                  </label>
                                  <input
                                    id="thumbnail-upload"
                                    ref={thumbnailInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      console.log('File selected:', file);
                                      if (file) {
                                        console.log('Course ID:', course?.id);
                                        if (course?.id) {
                                           try {
                                             console.log('Starting thumbnail upload for existing course...');
                                             setIsSubmitting(true);
                                              const uploadResult = await courseApi.uploadThumbnail(course.id, file);
                                              console.log('Thumbnail upload response:', uploadResult);
                                              console.log('Upload result type:', typeof uploadResult);
                                              console.log('Upload result keys:', Object.keys(uploadResult));
                                              
                                               // Handle different response structures
                                               const thumbnailUrl = uploadResult.url;
                                               console.log('Extracted thumbnail URL:', thumbnailUrl);
                                               field.onChange(thumbnailUrl);
                                               
                                               // Store file name for display
                                               selectedThumbnailFile.current = file;
                                               console.log('Stored file reference:', file.name);
                                               
                                               toast({
                                                 title: "Success", 
                                                 description: `Thumbnail "${file.name}" uploaded successfully!`,
                                               });
                                          } catch (error: any) {
                                            console.error('Thumbnail upload error:', error);
                                            console.error('Error details:', error.response?.data);
                                            toast({
                                              title: "Upload Error", 
                                              description: error.response?.data?.message || error.message || "Failed to upload thumbnail. The upload endpoint may not be available yet.",
                                              variant: "destructive",
                                            });
                                          } finally {
                                            setIsSubmitting(false);
                                          }
                                        } else {
                                          console.log('Storing file for new course...');
                                          // For new courses, store file reference and show file name
                                          selectedThumbnailFile.current = file;
                                          field.onChange(`pending-upload-${file.name}`);
                                          toast({
                                            title: "File Selected",
                                            description: "File will be uploaded when you save the course.",
                                          });
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              {field.value && (
                                <div className="mt-2">
                                  {field.value.startsWith('pending-upload-') ? (
                                    <div className="p-2 bg-blue-50 rounded border">
                                      <p className="text-sm text-blue-700 font-medium">
                                        📁 Selected: {field.value.replace('pending-upload-', '')}
                                      </p>
                                      <p className="text-xs text-blue-600">
                                        File will be uploaded when you save the course
                                      </p>
                                    </div>
                                   ) : field.value.startsWith('http') ? (
                                     <div className="space-y-2">
                                       <img src={field.value} alt="Thumbnail preview" className="w-20 h-20 object-cover rounded border" />
                                       <div className="p-2 bg-green-50 rounded border">
                                         <p className="text-xs text-green-600">✅ Uploaded successfully</p>
                                         <p className="text-sm text-green-700 font-medium">
                                           📁 {selectedThumbnailFile.current?.name || field.value.split('/').pop() || 'Uploaded file'}
                                         </p>
                                       </div>
                                     </div>
                                   ) : field.value ? (
                                     <div className="p-2 bg-green-50 rounded border">
                                       <p className="text-sm text-green-700">
                                         📁 Current file: {selectedThumbnailFile.current?.name || field.value.split('/').pop() || field.value}
                                       </p>
                                     </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a course thumbnail image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="xlsxFilePath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Materials (Excel File)</FormLabel>
                          <FormControl>
                             <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <label htmlFor="excel-upload" className="cursor-pointer">
                                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                                      <Upload className="w-4 h-4 mr-2" />
                                      {course?.id ? 'Upload File' : 'Select File'}
                                    </div>
                                  </label>
                                  <input
                                    id="excel-upload"
                                    ref={excelInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      console.log('Excel file selected:', file);
                                      if (file) {
                                        console.log('Course ID for Excel:', course?.id);
                                        if (course?.id) {
                                          try {
                                            console.log('Starting Excel upload for existing course...');
                                            setIsSubmitting(true);
                                            const uploadResult = await courseApi.uploadKmapExcel(course.id, file);
                                             const uploadedUrl = uploadResult.url;
                                             field.onChange(uploadedUrl);
                                             
                                             // Store file name for display
                                             selectedExcelFile.current = file;
                                             
                                             toast({
                                               title: "Success",
                                               description: `Excel file "${file.name}" uploaded successfully!`,
                                             });
                                          } catch (error: any) {
                                            console.error('Excel upload error:', error);
                                            console.error('Excel error details:', error.response?.data);
                                            toast({
                                              title: "Upload Error",
                                              description: error.response?.data?.message || error.message || "Failed to upload Excel file. The upload endpoint may not be available yet.",
                                              variant: "destructive",
                                            });
                                          } finally {
                                            setIsSubmitting(false);
                                          }
                                        } else {
                                          console.log('Storing Excel file for new course...');
                                          // For new courses, store file reference
                                          selectedExcelFile.current = file;
                                          field.onChange(`pending-upload-${file.name}`);
                                          toast({
                                            title: "File Selected",
                                            description: "File will be uploaded when you save the course.",
                                          });
                                        }
                                      }
                                    }}
                                  />
                               </div>
                              {field.value && (
                                <div className="mt-2">
                                  {field.value.startsWith('pending-upload-') ? (
                                    <div className="p-2 bg-blue-50 rounded border">
                                      <p className="text-sm text-blue-700 font-medium">
                                        📄 Selected: {field.value.replace('pending-upload-', '')}
                                      </p>
                                      <p className="text-xs text-blue-600">
                                        File will be uploaded when you save the course
                                      </p>
                                    </div>
                                   ) : field.value.startsWith('http') ? (
                                     <div className="p-2 bg-green-50 rounded border">
                                       <p className="text-xs text-green-600">✅ Uploaded successfully</p>
                                       <p className="text-sm text-green-700 font-medium">
                                         📄 {selectedExcelFile.current?.name || field.value.split('/').pop() || 'Uploaded file'}
                                       </p>
                                     </div>
                                   ) : field.value ? (
                                     <div className="p-2 bg-green-50 rounded border">
                                       <p className="text-sm text-green-700">
                                         📄 Current file: {selectedExcelFile.current?.name || field.value.split('/').pop() || field.value}
                                       </p>
                                     </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload course materials in Excel format
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preview</label>
                      <div className="w-48 h-32 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={form.watch("thumbnail") || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop&crop=center"}
                          alt={form.watch("thumbnail") ? "Course thumbnail preview" : "Course placeholder"}
                          className={`w-full h-full object-cover ${!form.watch("thumbnail") ? 'opacity-60' : ''}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop&crop=center";
                            (e.target as HTMLImageElement).className = "w-full h-full object-cover opacity-60";
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Settings</CardTitle>
                    <CardDescription>
                      Configure course status and visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div>
                                    <div className="font-medium">{status.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {status.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Set the current status of the course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Update Course" : "Create Course"}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>

        {/* Additional Information for Editing */}
        {isEditing && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Course ID</p>
                  <p className="font-mono text-xs">{course.id}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Current Rating</p>
                  <p>{course.averageRating} ⭐</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Created By</p>
                  <p>{course.createdByName}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Created Date</p>
                  <p>{new Date(course.createdDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Last Modified By</p>
                  <p>{course.modifiedByName}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Last Modified Date</p>
                  <p>{new Date(course.modifiedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}