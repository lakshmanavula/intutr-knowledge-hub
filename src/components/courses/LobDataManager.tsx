import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  GripVertical,
  FileText,
  Video,
  FileImage,
  BookOpen,
  ClipboardCheck,
  Clock,
  Eye,
  EyeOff,
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
import { lobDataApi } from "@/services/api";
import type { CourseTopic, LobData } from "@/types/api";
import { LobDataForm } from "./LobDataForm";

interface LobDataManagerProps {
  topic: CourseTopic;
  onBack: () => void;
}

const LOB_TYPE_ICONS = {
  CONTENT: FileText,
  VIDEO: Video,
  DOCUMENT: FileImage,
  EXERCISE: BookOpen,
  ASSESSMENT: ClipboardCheck,
};

const LOB_TYPE_COLORS = {
  CONTENT: "bg-blue-500 text-white",
  VIDEO: "bg-red-500 text-white", 
  DOCUMENT: "bg-green-500 text-white",
  EXERCISE: "bg-orange-500 text-white",
  ASSESSMENT: "bg-purple-500 text-white",
};

export function LobDataManager({ topic, onBack }: LobDataManagerProps) {
  const [lobData, setLobData] = useState<LobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLobData, setEditingLobData] = useState<LobData | null>(null);
  const [deleteLobData, setDeleteLobData] = useState<LobData | null>(null);
  
  const { toast } = useToast();

  const fetchLobData = async () => {
    try {
      setLoading(true);
      const response = await lobDataApi.getByTopic(topic.id);
      const sortedLobData = response.sort((a, b) => a.orderIndex - b.orderIndex);
      setLobData(sortedLobData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch content items. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching lob data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobData();
  }, [topic.id]);

  const handleDelete = async (lob: LobData) => {
    try {
      await lobDataApi.delete(lob.id);
      toast({
        title: "Success",
        description: `Content item "${lob.lobName}" deleted successfully.`,
      });
      fetchLobData();
      setDeleteLobData(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (lob: LobData) => {
    try {
      await lobDataApi.toggleActive(lob.id);
      toast({
        title: "Success",
        description: `Content item "${lob.lobName}" ${lob.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
      fetchLobData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content item status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredLobData = lobData.filter(lob =>
    lob.lobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lob.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getLobTypeIcon = (type: LobData['lobType']) => {
    const Icon = LOB_TYPE_ICONS[type];
    return <Icon className="w-4 h-4" />;
  };

  if (showCreateForm) {
    return (
      <LobDataForm
        topicId={topic.id}
        onSuccess={() => {
          setShowCreateForm(false);
          fetchLobData();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingLobData) {
    return (
      <LobDataForm
        lobData={editingLobData}
        topicId={topic.id}
        onSuccess={() => {
          setEditingLobData(null);
          fetchLobData();
        }}
        onCancel={() => setEditingLobData(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Content Items</h1>
          <p className="text-muted-foreground">
            Manage content for topic "{topic.topicName}"
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Topic Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{topic.topicName}</h3>
              <p className="text-muted-foreground">{topic.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={topic.isActive ? "default" : "secondary"}>
                  {topic.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Order: {topic.orderIndex} • {topic.totalLOBs} total LOBs • {lobData.length} content items
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
              placeholder="Search content items by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Items ({filteredLobData.length})</CardTitle>
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
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLobData.map((lob) => (
                  <TableRow key={lob.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <span className="text-sm font-medium">{lob.orderIndex}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lob.lobName}</div>
                        <div className="text-sm text-muted-foreground">
                          {lob.content.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={LOB_TYPE_COLORS[lob.lobType]}>
                        <div className="flex items-center gap-1">
                          {getLobTypeIcon(lob.lobType)}
                          {lob.lobType}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(lob.estimatedTimeMinutes)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lob.isActive ? "default" : "secondary"}>
                        {lob.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       {lob.content ? (
                         <div className="text-sm text-muted-foreground">Has content</div>
                       ) : (
                         <span className="text-muted-foreground text-sm">No content</span>
                       )}
                    </TableCell>
                    <TableCell>{lob.createdByName}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingLobData(lob)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Content
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActive(lob)}>
                            {lob.isActive ? (
                              <EyeOff className="mr-2 h-4 w-4" />
                            ) : (
                              <Eye className="mr-2 h-4 w-4" />
                            )}
                            {lob.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteLobData(lob)}
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

          {!loading && filteredLobData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No content items found matching your search." : "No content items created yet."}
              </p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add First Content Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLobData} onOpenChange={() => setDeleteLobData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content item
              "{deleteLobData?.lobName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLobData && handleDelete(deleteLobData)}
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