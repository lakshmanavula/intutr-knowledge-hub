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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      
      // Fetch KMap topics
      console.log('Fetching KMap topics for courseId:', courseId);
      const kmapResponse = await courseApi.getKmapTopics(courseId);
      console.log('KMap topics response:', kmapResponse);
      setKmapTopics(Array.isArray(kmapResponse) ? kmapResponse : []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch course data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndTopics();
  }, [courseId]);

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

  const filteredKmapTopics = (Array.isArray(kmapTopics) ? kmapTopics : []).filter(topic =>
    topic.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (topic.keywords && topic.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTotalContentCount = (metaData: KMapTopic['metaData']) => {
    return Object.values(metaData).reduce((sum, count) => sum + count, 0);
  };

  if (!courseId) {
    navigate('/courses');
    return null;
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
          <h1 className="text-3xl font-bold text-foreground">KMap Topics</h1>
          <p className="text-muted-foreground">
            View and download KMap topics for "{course?.name || 'Loading...'}"
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleDownloadKmapData}
          disabled={downloading || !course}
        >
          <Download className="w-4 h-4 mr-2" />
          {downloading ? "Downloading..." : "Download KMap Data"}
        </Button>
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
                    {filteredKmapTopics.length} KMap topics
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
              placeholder="Search KMap topics by title, description, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* KMap Topics Table */}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Topic Title</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Topic Ancestors</TableHead>
                  <TableHead>Track Num</TableHead>
                  <TableHead>Topic Level</TableHead>
                  <TableHead>Topic Sequence</TableHead>
                  <TableHead>Quiz Sequence</TableHead>
                  <TableHead>Meta Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKmapTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-mono text-xs">{topic.id}</TableCell>
                    <TableCell>{topic.courseName}</TableCell>
                    <TableCell>
                      <div className="font-medium">{topic.topicTitle}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {topic.keywords || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {topic.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {topic.topicAncestors.length > 0 ? JSON.stringify(topic.topicAncestors) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{topic.trackNum}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Level {topic.topicLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{topic.topicSeqNum}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{topic.quizSeqNum}</div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Meta Data - {topic.topicTitle}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Text Count:</span>
                                <span>{topic.metaData.textCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">MCQ Count:</span>
                                <span>{topic.metaData.mcqCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">MCQM Count:</span>
                                <span>{topic.metaData.mcqmCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">TOF Count:</span>
                                <span>{topic.metaData.tofCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">MTF Count:</span>
                                <span>{topic.metaData.mtfCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">SEQ Count:</span>
                                <span>{topic.metaData.seqCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">FITB Count:</span>
                                <span>{topic.metaData.fitbCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">PIC Count:</span>
                                <span>{topic.metaData.picCount}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Short Count:</span>
                                <span>{topic.metaData.shortCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Essay Count:</span>
                                <span>{topic.metaData.essayCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Num Count:</span>
                                <span>{topic.metaData.numCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Mnemonics Count:</span>
                                <span>{topic.metaData.mnemonicsCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Video Count:</span>
                                <span>{topic.metaData.videoCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Link Count:</span>
                                <span>{topic.metaData.linkCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Stmt Count:</span>
                                <span>{topic.metaData.stmtCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Pairs Count:</span>
                                <span>{topic.metaData.pairsCount}</span>
                              </div>
                            </div>
                            <div className="col-span-2 pt-4 border-t">
                              <div className="flex justify-between text-lg font-semibold">
                                <span>Total Content:</span>
                                <span>{getTotalContentCount(topic.metaData)}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredKmapTopics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No KMap topics found matching your search." : "No KMap topics available for this course."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}