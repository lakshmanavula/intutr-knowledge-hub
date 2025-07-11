import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
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
import { 
  Settings2, 
  BookOpen, 
  Users, 
  Star, 
  DollarSign, 
  Clock, 
  Shield, 
  Mail,
  Bell,
  Palette,
  Globe
} from "lucide-react";

const courseSettingsSchema = z.object({
  defaultDuration: z.number().min(1, "Duration must be at least 1 day"),
  defaultFees: z.number().min(0, "Fees cannot be negative"),
  autoApproval: z.boolean(),
  requireThumbnail: z.boolean(),
  maxTopicsPerCourse: z.number().min(1, "Must allow at least 1 topic"),
  maxLobsPerTopic: z.number().min(1, "Must allow at least 1 LOB"),
  defaultStatus: z.enum(["DRAFT", "CREATED", "PUBLISHED", "ARCHIVED"]),
  allowPublicReviews: z.boolean(),
  minRatingToShow: z.number().min(1).max(5),
  enableCourseCategories: z.boolean(),
});

const platformSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  supportEmail: z.string().email("Invalid email address"),
  maxUsersPerPage: z.number().min(5).max(100),
  enableNotifications: z.boolean(),
  enableEmailAlerts: z.boolean(),
  enableUserRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  sessionTimeout: z.number().min(15).max(1440), // 15 minutes to 24 hours
});

const securitySettingsSchema = z.object({
  passwordMinLength: z.number().min(6).max(32),
  requireSpecialChars: z.boolean(),
  requireNumbers: z.boolean(),
  requireUppercase: z.boolean(),
  enableTwoFactor: z.boolean(),
  loginAttempts: z.number().min(3).max(10),
  lockoutDuration: z.number().min(5).max(60), // 5 to 60 minutes
});

type CourseSettingsValues = z.infer<typeof courseSettingsSchema>;
type PlatformSettingsValues = z.infer<typeof platformSettingsSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("course");
  const { toast } = useToast();

  const courseForm = useForm<CourseSettingsValues>({
    resolver: zodResolver(courseSettingsSchema),
    defaultValues: {
      defaultDuration: 30,
      defaultFees: 99.99,
      autoApproval: false,
      requireThumbnail: true,
      maxTopicsPerCourse: 20,
      maxLobsPerTopic: 50,
      defaultStatus: "DRAFT",
      allowPublicReviews: true,
      minRatingToShow: 1,
      enableCourseCategories: true,
    },
  });

  const platformForm = useForm<PlatformSettingsValues>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      siteName: "Intutr Kmap",
      siteDescription: "Advanced Learning Management Platform",
      supportEmail: "support@intutrkmap.com",
      maxUsersPerPage: 20,
      enableNotifications: true,
      enableEmailAlerts: true,
      enableUserRegistration: true,
      requireEmailVerification: true,
      sessionTimeout: 120, // 2 hours
    },
  });

  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      enableTwoFactor: false,
      loginAttempts: 5,
      lockoutDuration: 15,
    },
  });

  const onSubmitCourse = (data: CourseSettingsValues) => {
    console.log("Course settings:", data);
    toast({ title: "Course settings saved successfully" });
  };

  const onSubmitPlatform = (data: PlatformSettingsValues) => {
    console.log("Platform settings:", data);
    toast({ title: "Platform settings saved successfully" });
  };

  const onSubmitSecurity = (data: SecuritySettingsValues) => {
    console.log("Security settings:", data);
    toast({ title: "Security settings saved successfully" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your platform settings and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="course" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Course</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Platform</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* Course Settings */}
        <TabsContent value="course" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Course Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(onSubmitCourse)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={courseForm.control}
                      name="defaultDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Course Duration (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Default duration for new courses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={courseForm.control}
                      name="defaultFees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Course Fees ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Default pricing for new courses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={courseForm.control}
                      name="maxTopicsPerCourse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Topics per Course</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of topics allowed per course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={courseForm.control}
                      name="maxLobsPerTopic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max LOBs per Topic</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of learning objects per topic
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={courseForm.control}
                    name="defaultStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Course Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select default status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="CREATED">Created</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Status assigned to newly created courses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={courseForm.control}
                      name="autoApproval"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-approve Courses</FormLabel>
                            <FormDescription>
                              Automatically approve new courses without manual review
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

                    <FormField
                      control={courseForm.control}
                      name="requireThumbnail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Thumbnail</FormLabel>
                            <FormDescription>
                              Make thumbnail image mandatory for all courses
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

                    <FormField
                      control={courseForm.control}
                      name="enableCourseCategories"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Categories</FormLabel>
                            <FormDescription>
                              Allow courses to be organized into categories
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

                    <FormField
                      control={courseForm.control}
                      name="allowPublicReviews"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Public Reviews</FormLabel>
                            <FormDescription>
                              Allow public reviews and ratings for courses
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

                  <FormField
                    control={courseForm.control}
                    name="minRatingToShow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Rating to Display</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select minimum rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 Star</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Minimum rating required to display course publicly
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Save Course Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Platform Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...platformForm}>
                <form onSubmit={platformForm.handleSubmit(onSubmitPlatform)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={platformForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Name displayed in browser title and headers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={platformForm.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address for user support inquiries
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={platformForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          Brief description of your platform for SEO and social sharing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={platformForm.control}
                      name="maxUsersPerPage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Users per Page</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of users to display per page in listings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={platformForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            How long user sessions remain active
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={platformForm.control}
                      name="enableNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Notifications</FormLabel>
                            <FormDescription>
                              Show in-app notifications to users
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

                    <FormField
                      control={platformForm.control}
                      name="enableEmailAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Alerts</FormLabel>
                            <FormDescription>
                              Send email notifications for important events
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

                    <FormField
                      control={platformForm.control}
                      name="enableUserRegistration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">User Registration</FormLabel>
                            <FormDescription>
                              Allow new users to register accounts
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

                    <FormField
                      control={platformForm.control}
                      name="requireEmailVerification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Verification</FormLabel>
                            <FormDescription>
                              Require email verification for new accounts
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

                  <Button type="submit">Save Platform Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={securityForm.control}
                      name="passwordMinLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Password Length</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum characters required for passwords
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="loginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Login Attempts</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Failed attempts before account lockout
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="lockoutDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lockout Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            How long accounts remain locked after failed attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={securityForm.control}
                      name="requireSpecialChars"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Special Characters</FormLabel>
                            <FormDescription>
                              Passwords must contain special characters
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

                    <FormField
                      control={securityForm.control}
                      name="requireNumbers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Numbers</FormLabel>
                            <FormDescription>
                              Passwords must contain numeric characters
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

                    <FormField
                      control={securityForm.control}
                      name="requireUppercase"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Uppercase</FormLabel>
                            <FormDescription>
                              Passwords must contain uppercase letters
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

                    <FormField
                      control={securityForm.control}
                      name="enableTwoFactor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                            <FormDescription>
                              Enable 2FA for enhanced security
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

                  <Button type="submit">Save Security Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance & Theming</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Theme Customization</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced theming options coming soon. Customize colors, fonts, and layout preferences.
                  </p>
                  <Button variant="outline" disabled>
                    Customize Theme
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}