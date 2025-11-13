import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Sparkles,
  Trash2,
  Star,
  BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MarkdownEditor } from "@/components/dashboard/MarkdownEditor";
import { DeleteNoteDialog } from "@/components/dashboard/DeleteNoteDialog";
import { TagManager } from "@/components/dashboard/TagManager";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  user_id: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      }
    });

    loadNotes();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading notes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const createNewNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title: "Untitled Note",
        content: "",
        tags: [],
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotes([data, ...notes]);
      setSelectedNote(data);
      toast({
        title: "Note created",
        description: "Start writing your thoughts!",
      });
    }
  };

  const updateNote = async (updates: Partial<Note>) => {
    if (!selectedNote) return;

    const { error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", selectedNote.id);

    if (error) {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const updatedNote = { ...selectedNote, ...updates };
      setSelectedNote(updatedNote);
      setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n));
    }
  };

  const deleteNote = async () => {
    if (!selectedNote) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", selectedNote.id);

    if (error) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotes(notes.filter(n => n.id !== selectedNote.id));
      setSelectedNote(null);
      setDeleteDialogOpen(false);
      toast({
        title: "Note deleted",
        description: "Your note has been permanently deleted.",
      });
    }
  };

  const toggleFavorite = async () => {
    if (!selectedNote) return;
    await updateNote({ favorite: !selectedNote.favorite });
    toast({
      title: selectedNote.favorite ? "Removed from favorites" : "Added to favorites",
      description: selectedNote.favorite 
        ? "Note removed from your favorites" 
        : "Note added to your favorites",
    });
  };

  const summarizeNote = async () => {
    if (!selectedNote?.content) {
      toast({
        title: "No content",
        description: "Add some content to your note first.",
        variant: "destructive",
      });
      return;
    }

    setIsSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-note", {
        body: { content: selectedNote.content },
      });

      if (error) throw error;

      toast({
        title: "Summary generated",
        description: data.summary,
        duration: 10000,
      });
    } catch (error) {
      toast({
        title: "Error generating summary",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const generateTags = async () => {
    if (!selectedNote?.content && !selectedNote?.title) {
      toast({
        title: "No content",
        description: "Add a title or content to your note first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTags(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-tags", {
        body: { 
          title: selectedNote.title,
          content: selectedNote.content || ""
        },
      });

      if (error) throw error;

      await updateNote({ tags: data.tags });
      toast({
        title: "Tags generated",
        description: `Added ${data.tags.length} tags to your note`,
      });
    } catch (error) {
      toast({
        title: "Error generating tags",
        description: error instanceof Error ? error.message : "Failed to generate tags",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !filterFavorites || note.favorite;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <Logo />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ 
            width: sidebarOpen ? 320 : 0,
            opacity: sidebarOpen ? 1 : 0 
          }}
          className="border-r border-border bg-card overflow-hidden"
        >
          <div className="p-4 space-y-4 h-full flex flex-col">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            <Tabs value={filterFavorites ? "favorites" : "all"} onValueChange={(v) => setFilterFavorites(v === "favorites")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">
                  <BookOpen className="w-4 h-4 mr-2" />
                  All Notes
                </TabsTrigger>
                <TabsTrigger value="favorites">
                  <Star className="w-4 h-4 mr-2" />
                  Favorites
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* New Note Button */}
            <Button variant="hero" className="w-full justify-start" onClick={createNewNote}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`p-4 cursor-pointer transition-smooth hover:card-shadow ${
                    selectedNote?.id === note.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold mb-1 line-clamp-1 flex-1">{note.title}</h3>
                    {note.favorite && <Star className="w-4 h-4 fill-primary text-primary flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedNote ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col p-6 overflow-auto"
            >
              <div className="max-w-4xl mx-auto w-full space-y-4">
                {/* Title and Actions */}
                <div className="flex justify-between items-start gap-4">
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => updateNote({ title: e.target.value })}
                    className="text-3xl font-bold border-none shadow-none p-0 focus-visible:ring-0 flex-1"
                    placeholder="Note title..."
                  />
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleFavorite}
                    >
                      <Star className={`w-4 h-4 ${selectedNote.favorite ? 'fill-primary text-primary' : ''}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={summarizeNote}
                      disabled={isSummarizing}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isSummarizing ? "Summarizing..." : "Summarize"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Markdown Editor */}
                <MarkdownEditor
                  value={selectedNote.content || ""}
                  onChange={(value) => updateNote({ content: value })}
                />

                {/* Tag Manager */}
                <TagManager
                  tags={selectedNote.tags}
                  onTagsChange={(tags) => updateNote({ tags })}
                  onGenerateTags={generateTags}
                  isGenerating={isGeneratingTags}
                />
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="max-w-md">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">No note selected</h2>
                <p className="text-muted-foreground mb-6">
                  Select a note from the sidebar or create a new one to get started.
                </p>
                <Button variant="hero" onClick={createNewNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      {selectedNote && (
        <DeleteNoteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={deleteNote}
          noteTitle={selectedNote.title}
        />
      )}
    </div>
  );
};

export default Dashboard;
