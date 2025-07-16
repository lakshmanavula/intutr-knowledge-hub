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
                          {topic.metaData.mcqCount} MCQ • {topic.metaData.videoCount} Video • {topic.metaData.textCount} Text
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
                {searchTerm ? "No KMap topics found matching your search." : "No KMap topics available for this course."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}