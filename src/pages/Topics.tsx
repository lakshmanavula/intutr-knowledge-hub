import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  List,
  Download,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { courseTopicApi, lobDataApi, courseApi } from "@/services/api";
import type { Course, CourseTopic } from "@/types/api";

// KMap Topic interface based on the provided data structure
interface KMapTopic {
  id: string;
  createdBy: string;
  modifiedBy: string;
  createdByName: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
  courseId: string;
  courseName: string;
  topicTitle: string;
  description: string | null;
  keywords: string | null;
  trackNum: string;
  topicLevel: number;
  topicSeqNum: string;
  quizSeqNum: string;
  topicAncestors: any[];
  metaData: {
    textCount: number;
    mcqCount: number;
    mcqmCount: number;
    tofCount: number;
    mtfCount: number;
    seqCount: number;
    fitbCount: number;
    picCount: number;
    shortCount: number;
    essayCount: number;
    numCount: number;
    mnemonicsCount: number;
    videoCount: number;
    linkCount: number;
    stmtCount: number;
    pairsCount: number;
  };
}
import { CourseTopicForm } from "@/components/courses/CourseTopicForm";
import { LobDataManager } from "@/components/courses/LobDataManager";

export default function Topics() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [kmapTopics, setKmapTopics] = useState<KMapTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<CourseTopic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<CourseTopic | null>(null);
  const [managingLobDataTopic, setManagingLobDataTopic] = useState<CourseTopic | null>(null);
  const [lobDataCounts, setLobDataCounts] = useState<Record<string, number>>({});
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'course-topics' | 'kmap-topics'>('course-topics');

  const fetchCourseAndTopics = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await courseApi.getById(courseId);
      setCourse(courseResponse);
      
      // Fetch course topics
      const topicsResponse = await courseTopicApi.getByCourse(courseId);
      const sortedTopics = topicsResponse.sort((a, b) => a.orderIndex - b.orderIndex);
      setTopics(sortedTopics);
      
      // Fetch KMap topics
      try {
        const kmapResponse = await courseApi.getKmapTopics(courseId);
        setKmapTopics(Array.isArray(kmapResponse) ? kmapResponse : []);
      } catch (kmapError) {
        console.error("Error fetching KMap topics:", kmapError);
        setKmapTopics([]);
      }
      
      // Fetch lob data counts for each topic
      const counts: Record<string, number> = {};
      await Promise.all(
        (Array.isArray(sortedTopics) ? sortedTopics : []).map(async (topic) => {
          try {
            const lobData = await lobDataApi.getByTopic(topic.id);
            counts[topic.id] = Array.isArray(lobData) ? lobData.length : 0;
          } catch (error) {
            counts[topic.id] = 0;
          }
        })
      );
      setLobDataCounts(counts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch course data. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndTopics();
  }, [courseId]);

  const handleDelete = async (topic: CourseTopic) => {
    try {
      await courseTopicApi.delete(topic.id);
      toast({
        title: "Success",
        description: `Topic "${topic.topicName}" deleted successfully.`,
      });
      fetchCourseAndTopics();
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
      fetchCourseAndTopics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadKmapData = async () => {
    if (!courseId || !course) return;
    
    try {
      setDownloading(true);
      const blob = await courseApi.downloadKmapExcel(courseId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `kmap-data-${course.name.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `KMap data downloaded successfully for "${course.name}".`,
      });
    } catch (error) {
      const errorMessage = error.message || "Failed to download KMap data. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error downloading KMap data:", error);
    } finally {
      setDownloading(false);
    }
  };

  const filteredTopics = (Array.isArray(topics) ? topics : []).filter(topic =>
    topic.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKmapTopics = (Array.isArray(kmapTopics) ? kmapTopics : []).filter(topic =>
    topic.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (topic.keywords && topic.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getTotalContentCount = (metaData: KMapTopic['metaData']) => {
    return Object.values(metaData).reduce((sum, count) => sum + count, 0);
  };

  if (!courseId) {
    navigate('/courses');
    return null;
  }

  if (showCreateForm) {
    return (
      <CourseTopicForm
        courseId={courseId}
        onSuccess={() => {
          setShowCreateForm(false);
          fetchCourseAndTopics();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingTopic) {
    return (
      <CourseTopicForm
        topic={editingTopic}
        courseId={courseId}
        onSuccess={() => {
          setEditingTopic(null);
          fetchCourseAndTopics();
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
        <Button variant="outline" size="sm" onClick={() => navigate('/courses')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Course Topics</h1>
          <p className="text-muted-foreground">
            Manage topics and content for "{course?.name || 'Loading...'}"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'course-topics' | 'kmap-topics')}>
            <TabsList>
              <TabsTrigger value="course-topics">Course Topics</TabsTrigger>
              <TabsTrigger value="kmap-topics">KMap Topics</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            onClick={handleDownloadKmapData}
            disabled={downloading || !course}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download KMap Data"}
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Course Info Card */}
      {course && (
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
                    {Array.isArray(topics) ? topics.length : 0} topics • {Object.values(lobDataCounts || {}).reduce((a, b) => a + b, 0)} content items
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Topics Tables */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'course-topics' | 'kmap-topics')}>
        <TabsContent value="course-topics">
          <Card>
            <CardHeader>
              <CardTitle>Course Topics ({filteredTopics.length})</CardTitle>
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
        </TabsContent>

        <TabsContent value="kmap-topics">
          <Card>
            <CardHeader>
              <CardTitle>KMap Topics ({filteredKmapTopics.length})</CardTitle>
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
                      <TableHead>Track #</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Sequence</TableHead>
                      <TableHead>Content Count</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKmapTopics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell>
                          <Badge variant="outline">{topic.trackNum}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{topic.topicTitle}</div>
                            {topic.description && (
                              <div className="text-sm text-muted-foreground">
                                {topic.description}
                              </div>
                            )}
                            {topic.keywords && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Keywords: {topic.keywords}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Level {topic.topicLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Topic: {topic.topicSeqNum}</div>
                            <div className="text-muted-foreground">Quiz: {topic.quizSeqNum}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{getTotalContentCount(topic.metaData)} total</div>
                            <div className="text-muted-foreground">
                              {topic.metaData.mcqCount} MCQ, {topic.metaData.videoCount} Video, {topic.metaData.textCount} Text
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{topic.createdByName}</TableCell>
                        <TableCell>
                          {new Date(topic.createdDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && filteredKmapTopics.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No KMap topics found matching your search." : "No KMap topics available."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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