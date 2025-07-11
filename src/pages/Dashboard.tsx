import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FolderOpen,
  Users,
  TrendingUp,
  Star,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data for dashboard
const mockStats = {
  totalCourses: 156,
  totalCategories: 12,
  totalUsers: 2847,
  totalRevenue: 145720,
  coursesGrowth: 12.5,
  usersGrowth: 8.3,
  revenueGrowth: 15.2,
};

const recentCourses = [
  {
    id: "1",
    name: "Advanced React Development",
    category: "Programming",
    rating: 4.8,
    students: 234,
    revenue: 12450,
    status: "PUBLISHED",
  },
  {
    id: "2",
    name: "Machine Learning Basics",
    category: "Data Science",
    rating: 4.6,
    students: 187,
    revenue: 9875,
    status: "PUBLISHED",
  },
  {
    id: "3",
    name: "UI/UX Design Fundamentals",
    category: "Design",
    rating: 4.9,
    students: 312,
    revenue: 15680,
    status: "PUBLISHED",
  },
  {
    id: "4",
    name: "Digital Marketing Strategies",
    category: "Marketing",
    rating: 4.7,
    students: 145,
    revenue: 7890,
    status: "DRAFT",
  },
];

const topCategories = [
  { name: "Programming", courses: 45, students: 1234 },
  { name: "Data Science", courses: 23, students: 987 },
  { name: "Design", courses: 34, students: 756 },
  { name: "Marketing", courses: 18, students: 543 },
  { name: "Business", courses: 25, students: 678 },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PUBLISHED: "default",
      DRAFT: "secondary",
      ARCHIVED: "destructive",
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Time</p>
            <p className="text-lg font-semibold">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/courses')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCourses}</div>
            <p className="text-xs opacity-80">
              +{mockStats.coursesGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Active course categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{mockStats.usersGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-warning text-accent-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.totalRevenue)}</div>
            <p className="text-xs opacity-80">
              +{mockStats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses and Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>
              Latest courses added to your platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{course.name}</h4>
                    {getStatusBadge(course.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {course.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.students}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-success">
                    {formatCurrency(course.revenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>
              Most popular course categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.courses} courses
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{category.students}</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/courses')}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">Add Course</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/categories')}
            >
              <FolderOpen className="w-6 h-6" />
              <span className="text-sm">Add Category</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/users')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/reviews')}
            >
              <Star className="w-6 h-6" />
              <span className="text-sm">View Reviews</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}