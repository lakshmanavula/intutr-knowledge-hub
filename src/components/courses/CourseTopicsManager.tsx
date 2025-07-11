import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  GripVertical,
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  Move,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { courseTopicApi, lobDataApi } from "@/services/api";
import type { Course, CourseTopic, LobData } from "@/types/api";
import { CourseTopicForm } from "./CourseTopicForm";
import { LobDataManager } from "./LobDataManager";

interface CourseTopicsManagerProps {
  course: Course;
  onBack: () => void;
}

export function CourseTopicsManager({ course, onBack }: CourseTopicsManagerProps) {
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<CourseTopic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<CourseTopic | null>(null);
  const [managingLobDataTopic, setManagingLobDataTopic] = useState<CourseTopic | null>(null);
  const [lobDataCounts, setLobDataCounts] = useState<Record<string, number>>({});
  
  const { toast } = useToast();

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await courseTopicApi.getByCourse(course.id);
      const sortedTopics = response.sort((a, b) => a.orderIndex - b.orderIndex);
      setTopics(sortedTopics);
      
      // Fetch lob data counts for each topic
      const counts: Record<string, number> = {};
      await Promise.all(
        sortedTopics.map(async (topic) => {
          try {
            const lobData = await lobDataApi.getByTopic(topic.id);
            counts[topic.id] = lobData.length;
          } catch (error) {
            counts[topic.id] = 0;
          }
        })
      );
      setLobDataCounts(counts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch topics. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [course.id]);

  const handleDelete = async (topic: CourseTopic) => {
    try {
      await courseTopicApi.delete(topic.id);
      toast({
        title: "Success",
        description: `Topic "${topic.topicName}" deleted successfully.`,
      });
      fetchTopics();
      setDeleteTopic(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (topic: CourseTopic) => {
    try {
      await courseTopicApi.toggleActive(topic.id);
      toast({
        title: "Success",
        description: `Topic "${topic.topicName}" ${topic.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
      fetchTopics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTopics = topics.filter(topic =>
    topic.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (showCreateForm) {
    return (
      <CourseTopicForm
        courseId={course.id}
        onSuccess={() => {
          setShowCreateForm(false);
          fetchTopics();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingTopic) {
    return (
      <CourseTopicForm
        topic={editingTopic}
        courseId={course.id}
        onSuccess={() => {
          setEditingTopic(null);
          fetchTopics();
        }}
        onCancel={() => setEditingTopic(null)}
      />
    );
  }

  if (managingLobDataTopic) {
    return (
      <LobDataManager
        topic={managingLobDataTopic}
        onBack={() => setManagingLobDataTopic(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Course Topics</h1>
          <p className="text-muted-foreground">
            Manage topics and content for "{course.name}"
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {/* Course Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{course.name}</h3>
              <p className="text-muted-foreground">{course.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{course.categoryName}</Badge>
                <Badge className={
                  course.status === 'PUBLISHED' ? 'bg-success text-success-foreground' :
                  course.status === 'DRAFT' ? 'bg-warning text-warning-foreground' :
                  'bg-muted text-muted-foreground'
                }>
                  {course.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {topics.length} topics • {Object.values(lobDataCounts).reduce((a, b) => a + b, 0)} content items
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search topics by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Topics ({filteredTopics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Content Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <span className="text-sm font-medium">{topic.orderIndex}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{topic.topicName}</div>
                        <div className="text-sm text-muted-foreground">
                          {topic.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(topic.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <List className="w-3 h-3" />
                        <span>{lobDataCounts[topic.id] || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={topic.isActive ? "default" : "secondary"}>
                        {topic.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{topic.createdByName}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTopic(topic)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Topic
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setManagingLobDataTopic(topic)}>
                            <List className="mr-2 h-4 w-4" />
                            Manage Content
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActive(topic)}>
                            {topic.isActive ? (
                              <EyeOff className="mr-2 h-4 w-4" />
                            ) : (
                              <Eye className="mr-2 h-4 w-4" />
                            )}
                            {topic.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTopic(topic)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No topics found matching your search." : "No topics created yet."}
              </p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add First Topic
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTopic} onOpenChange={() => setDeleteTopic(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the topic
              "{deleteTopic?.topicName}" and all its content items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTopic && handleDelete(deleteTopic)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}