import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Download,
  Eye,
  Settings,
  FileDown,
  Database,
} from "lucide-react";
import QuizRenderer from "@/components/lob/QuizRenderer";
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { courseApi, lobFountMasterApi } from "@/services/api";
import type { Course, LobFountMaster, PaginatedResponse } from "@/types/api";

// Track interface
interface Track {
  trackNumber: string;  // API returns trackNumber, not trackNum
  trackName: string;
}

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
    text_count: number;
    mcq_count: number;
    mcqm_count: number;
    tof_count: number;
    mtf_count: number;
    seq_count: number;
    fitb_count: number;
    pic_count: number;
    short_count: number;
    essay_count: number;
    num_count: number;
    mnemonics_count: number;
    video_count: number;
    link_count: number;
    stmt_count: number;
    pairs_count: number;
  };
}

export default function Topics() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [kmapTopics, setKmapTopics] = useState<KMapTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [allLobData, setAllLobData] = useState<LobFountMaster[]>([]);
  const [lobLoading, setLobLoading] = useState(false);
  const [showAllLobs, setShowAllLobs] = useState(false);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: false,
    trackNum: false,
    topicLevel: false,
    topicSequence: false,
    quizSequence: false,
  });

  const fetchCourseAndTracks = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await courseApi.getById(courseId);
      setCourse(courseResponse);
      
      // Fetch track names
      console.log('Fetching tracks for courseId:', courseId);
      const tracksResponse = await courseApi.getTrackNames(courseId);
      console.log('Tracks response:', tracksResponse);
      const tracksArray = Array.isArray(tracksResponse) ? tracksResponse : [];
      setTracks(tracksArray);
      
      // Select first track by default and fetch its topics
      if (tracksArray.length > 0) {
        const firstTrack = tracksArray[0].trackNumber;
        setSelectedTrack(firstTrack);
        await fetchTopicsForTrack(firstTrack);
      }
      
    } catch (error) {
      console.error("Error fetching course and tracks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch course data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsForTrack = async (trackNum: string) => {
    if (!courseId || !trackNum) return;
    
    try {
      setTracksLoading(true);
      
      // Fetch topics for selected track
      console.log('Fetching topics for courseId:', courseId, 'trackNum:', trackNum);
      const topicsResponse = await courseApi.getTopicsByTrack(courseId, trackNum);
      console.log('Topics for track response:', topicsResponse);
      setKmapTopics(Array.isArray(topicsResponse) ? topicsResponse : []);
      
    } catch (error) {
      console.error("Error fetching topics for track:", error);
      toast({
        title: "Error",
        description: "Failed to fetch topics for selected track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTracksLoading(false);
    }
  };

  const handleTrackSelect = async (trackNumber: string) => {
    setSelectedTrack(trackNumber);
    await fetchTopicsForTrack(trackNumber);
  };

  useEffect(() => {
    fetchCourseAndTracks();
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

  const handleFetchAllLobData = async () => {
    try {
      setLobLoading(true);
      setShowAllLobs(true);
      console.log('Fetching all LOB data...');
      const response = await lobFountMasterApi.getPaginated(0, 1000); // Get a large number to show all
      console.log('LOB response:', response);
      console.log('LOB content:', response.content);
      setAllLobData(response.content || []);
    } catch (error) {
      console.error('Error fetching LOB data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch LOB data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLobLoading(false);
    }
  };

  const handleDownloadAllLobData = async () => {
    try {
      setDownloading(true);
      const blob = await lobFountMasterApi.downloadLobs(); // Download all LOBs
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `all-lob-data-${course?.name.replace(/[^a-zA-Z0-9]/g, '-') || 'course'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "All LOB data downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download LOB data. Please try again.",
        variant: "destructive",
      });
      console.error("Error downloading LOB data:", error);
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
            View and download KMap topics for "{course?.courseLabel || 'Loading...'}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadKmapData}
            disabled={downloading || !course}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download KMap Data"}
          </Button>
          <Button 
            onClick={handleFetchAllLobData} 
            disabled={lobLoading}
            variant="outline"
          >
            <Database className="mr-2 h-4 w-4" />
            {lobLoading ? "Loading..." : "View All LOBs"}
          </Button>
          <Button 
            onClick={handleDownloadAllLobData} 
            disabled={downloading}
            variant="outline"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {downloading ? "Downloading..." : "Download All LOBs"}
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
                <h3 className="text-xl font-semibold">{course.courseLabel}</h3>
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

      {/* Track Selection */}
      {tracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tracks.map((track, index) => (
                <Button
                  key={track.trackNumber || `track-${index}`}
                  variant={selectedTrack === track.trackNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTrackSelect(track.trackNumber)}
                  disabled={tracksLoading}
                >
                  {track.trackName || `Track ${track.trackNumber}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Column Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search KMap topics by title, description, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.id}
                  onCheckedChange={(checked) => 
                    setVisibleColumns(prev => ({ ...prev, id: checked }))
                  }
                >
                  ID
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.trackNum}
                  onCheckedChange={(checked) => 
                    setVisibleColumns(prev => ({ ...prev, trackNum: checked }))
                  }
                >
                  Track Number
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.topicLevel}
                  onCheckedChange={(checked) => 
                    setVisibleColumns(prev => ({ ...prev, topicLevel: checked }))
                  }
                >
                  Topic Level
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.topicSequence}
                  onCheckedChange={(checked) => 
                    setVisibleColumns(prev => ({ ...prev, topicSequence: checked }))
                  }
                >
                  Topic Sequence
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.quizSequence}
                  onCheckedChange={(checked) => 
                    setVisibleColumns(prev => ({ ...prev, quizSequence: checked }))
                  }
                >
                  Quiz Sequence
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* KMap Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>KMap Topics ({filteredKmapTopics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || tracksLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.id && <TableHead>ID</TableHead>}
                  <TableHead>Course Name</TableHead>
                  <TableHead>Topic Title</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Topic Ancestors</TableHead>
                  {visibleColumns.trackNum && <TableHead>Track Num</TableHead>}
                  {visibleColumns.topicLevel && <TableHead>Topic Level</TableHead>}
                  {visibleColumns.topicSequence && <TableHead>Topic Sequence</TableHead>}
                  {visibleColumns.quizSequence && <TableHead>Quiz Sequence</TableHead>}
                  <TableHead>Meta Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKmapTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    {visibleColumns.id && (
                      <TableCell className="font-mono text-xs max-w-24 truncate">
                        {topic.id}
                      </TableCell>
                    )}
                    <TableCell>{topic.courseName}</TableCell>
                    <TableCell>
                      <div className="font-medium">{topic.topicTitle}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-32 truncate">
                        {topic.keywords || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-48 truncate">
                        {topic.description || '-'}
                      </div>
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
                            <DialogTitle>Topic Ancestors - {topic.topicTitle}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            {topic.topicAncestors && topic.topicAncestors.length > 0 ? (
                              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                                {JSON.stringify(topic.topicAncestors, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-muted-foreground">No topic ancestors available</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    {visibleColumns.trackNum && (
                      <TableCell>
                        <Badge variant="outline">{topic.trackNum}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.topicLevel && (
                      <TableCell>
                        <Badge variant="secondary">Level {topic.topicLevel}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.topicSequence && (
                      <TableCell>
                        <div className="text-sm">{topic.topicSeqNum}</div>
                      </TableCell>
                    )}
                    {visibleColumns.quizSequence && (
                      <TableCell>
                        <div className="text-sm">{topic.quizSeqNum}</div>
                      </TableCell>
                    )}
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
                                <span>{topic.metaData.text_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">MCQ Count:</span>
                                <span>{topic.metaData.mcq_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">MCQM Count:</span>
                                <span>{topic.metaData.mcqm_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">TOF Count:</span>
                                <span>{topic.metaData.tof_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">MTF Count:</span>
                                <span>{topic.metaData.mtf_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">SEQ Count:</span>
                                <span>{topic.metaData.seq_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">FITB Count:</span>
                                <span>{topic.metaData.fitb_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">PIC Count:</span>
                                <span>{topic.metaData.pic_count}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Short Count:</span>
                                <span>{topic.metaData.short_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Essay Count:</span>
                                <span>{topic.metaData.essay_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Num Count:</span>
                                <span>{topic.metaData.num_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Mnemonics Count:</span>
                                <span>{topic.metaData.mnemonics_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Video Count:</span>
                                <span>{topic.metaData.video_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Link Count:</span>
                                <span>{topic.metaData.link_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Stmt Count:</span>
                                <span>{topic.metaData.stmt_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Pairs Count:</span>
                                <span>{topic.metaData.pairs_count}</span>
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

      {/* All LOBs Dialog */}
      <Dialog open={showAllLobs} onOpenChange={setShowAllLobs}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>All LOB Data</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {lobLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : allLobData && allLobData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allLobData?.map((lob) => (
                  <Card key={lob.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm truncate">{lob.topicTitle}</h4>
                        <Badge variant={lob.isActive ? "default" : "secondary"}>
                          {lob.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Type:</span> {lob.lobType}
                        </div>
                        <div>
                          <span className="font-medium">Track:</span> {lob.trackNum}
                        </div>
                        <div>
                          <span className="font-medium">Seq:</span> {lob.topicSeqNum}
                        </div>
                        <div>
                          <span className="font-medium">Quiz:</span> {lob.quizSeqNum}
                        </div>
                        <div>
                          <span className="font-medium">Level:</span> {lob.topicLevel}
                        </div>
                        <div>
                          <span className="font-medium">Chunk:</span> {lob.lobChunkIdx}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-xs">Content:</span>
                        {lob.lobType === 'QUIZ' ? (
                          <div className="mt-1">
                            <QuizRenderer content={typeof lob.lobData?.content === 'string' ? lob.lobData.content : JSON.stringify(lob.lobData || {})} isPreview={true} />
                          </div>
                        ) : (
                          <div className="bg-muted p-2 rounded mt-1 text-xs max-h-32 overflow-auto">
                            {lob.lobData.content}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div>Created: {new Date(lob.createdDate).toLocaleDateString()}</div>
                        <div>By: {lob.createdByName}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No LOB data available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}