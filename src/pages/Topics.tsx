import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Download,
  Eye,
  Settings,
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
import type { Course, LobFountMaster } from "@/types/api";

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
  const [lobData, setLobData] = useState<LobFountMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<'topics' | 'lobs'>('topics');
  
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
      console.log('Course details response:', courseResponse);
      setCourse(courseResponse);
      
      // Fetch track names
      console.log('Fetching tracks for courseId:', courseId);
      const tracksResponse = await courseApi.getTrackNames(courseId);
      console.log('Tracks response:', tracksResponse);
      const tracksArray = Array.isArray(tracksResponse) ? tracksResponse : [];
      setTracks(tracksArray);
      
      // Select first track by default and fetch its data
      if (tracksArray.length > 0) {
        const firstTrack = tracksArray[0].trackNumber;
        setSelectedTrack(firstTrack);
        await fetchDataForTrack(firstTrack);
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

  const fetchDataForTrack = async (trackNum: string) => {
    if (!courseId || !trackNum) return;
    
    try {
      setTracksLoading(true);
      
      if (viewMode === 'topics') {
        // Fetch topics for selected track
        console.log('Fetching topics for courseId:', courseId, 'trackNum:', trackNum);
        const topicsResponse = await courseApi.getTopicsByTrack(courseId, trackNum);
        console.log('Topics for track response:', topicsResponse);
        setKmapTopics(Array.isArray(topicsResponse) ? topicsResponse : []);
      } else {
        // Fetch LOB data for selected track
        console.log('Fetching LOB data for courseId:', courseId, 'trackNum:', trackNum);
        const lobResponse = await lobFountMasterApi.getByCourseAndTrack(courseId, trackNum);
        console.log('LOB data for track response:', lobResponse);
        setLobData(Array.isArray(lobResponse) ? lobResponse : []);
      }
      
    } catch (error) {
      console.error("Error fetching data for track:", error);
      toast({
        title: "Error",
        description: `Failed to fetch ${viewMode} for selected track. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setTracksLoading(false);
    }
  };

  const handleTrackSelect = async (trackNumber: string) => {
    setSelectedTrack(trackNumber);
    await fetchDataForTrack(trackNumber);
  };

  const handleViewModeToggle = async (mode: 'topics' | 'lobs') => {
    setViewMode(mode);
    if (selectedTrack) {
      await fetchDataForTrack(selectedTrack);
    }
  };

  useEffect(() => {
    fetchCourseAndTracks();
  }, [courseId]);

  useEffect(() => {
    if (selectedTrack) {
      fetchDataForTrack(selectedTrack);
    }
  }, [viewMode]);

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

  const handleDownloadLobData = async () => {
    if (!courseId || !course) return;
    
    try {
      setDownloading(true);
      const blob = await lobFountMasterApi.downloadCourseExcel(courseId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `lob-data-${course.name.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `LOB data downloaded successfully for "${course.name}".`,
      });
    } catch (error) {
      const errorMessage = error.message || "Failed to download LOB data. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error downloading LOB data:", error);
    } finally {
      setDownloading(false);
    }
  };

  const filteredKmapTopics = (Array.isArray(kmapTopics) ? kmapTopics : []).filter(topic =>
    (topic.topicTitle && topic.topicTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (topic.keywords && topic.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLobData = (Array.isArray(lobData) ? lobData : []).filter(lob =>
     (lob.topicName && lob.topicName.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (lob.content && lob.content.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold text-foreground">
            {viewMode === 'topics' ? 'KMap Topics' : 'LOB Data'}
          </h1>
          <p className="text-muted-foreground">
            View and download {viewMode === 'topics' ? 'KMap topics' : 'LOB data'} for "{course?.courseLabel || 'Loading...'}"
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
            variant="outline"
            onClick={handleDownloadLobData}
            disabled={downloading || !course}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download LOB Data"}
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
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Category:</span>
                    <Badge variant="outline">{course.categoryName}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Course Status:</span>
                    <Badge className={
                      course.status === 'PUBLISHED' ? 'bg-success text-success-foreground' :
                      course.status === 'DRAFT' ? 'bg-warning text-warning-foreground' :
                      'bg-muted text-muted-foreground'
                    }>
                      {course.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {viewMode === 'topics' 
                      ? `${filteredKmapTopics.length} KMap topics` 
                      : `${filteredLobData.length} LOB items`
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>View Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'topics' ? "default" : "outline"}
              onClick={() => handleViewModeToggle('topics')}
              disabled={tracksLoading}
            >
              KMap Topics
            </Button>
            <Button
              variant={viewMode === 'lobs' ? "default" : "outline"}
              onClick={() => handleViewModeToggle('lobs')}
              disabled={tracksLoading}
            >
              LOB Data
            </Button>
          </div>
        </CardContent>
      </Card>

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
                placeholder={`Search ${viewMode === 'topics' ? 'KMap topics by title, description, or keywords' : 'LOB data by title or content'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {viewMode === 'topics' && (
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'topics' 
              ? `KMap Topics (${filteredKmapTopics.length})` 
              : `LOB Data (${filteredLobData.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading || tracksLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'topics' ? (
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
          ) : (
            // LOB Data Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLobData.map((lob) => (
                <Card key={lob.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm truncate">{lob.topicName}</h4>
                      <Badge variant={lob.isActive ? "default" : "secondary"}>
                        {lob.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Type:</span> {lob.lobType}
                      </div>
                      <div>
                         <span className="font-medium">Track:</span> {lob.trackNumber}
                       </div>
                       <div>
                         <span className="font-medium">Type:</span> {lob.lobType}
                       </div>
                       <div>
                         <span className="font-medium">Difficulty:</span> {lob.difficulty}
                       </div>
                       <div>
                         <span className="font-medium">Time:</span> {lob.estimatedTimeMinutes}m
                       </div>
                       <div>
                         <span className="font-medium">Order:</span> {lob.orderIndex}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-xs">Content:</span>
                      {lob.lobType === 'QUIZ' ? (
                        <div className="mt-1">
                           <QuizRenderer content={lob.content} isPreview={true} />
                         </div>
                       ) : (
                         <div className="bg-muted p-2 rounded mt-1 text-xs max-h-32 overflow-auto">
                           {lob.content}
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
          )}

          {!loading && !tracksLoading && (
            (viewMode === 'topics' && filteredKmapTopics.length === 0) ||
            (viewMode === 'lobs' && filteredLobData.length === 0)
          ) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `No ${viewMode === 'topics' ? 'KMap topics' : 'LOB data'} found matching your search.` 
                  : `No ${viewMode === 'topics' ? 'KMap topics' : 'LOB data'} available for this course.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}