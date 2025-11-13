import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <h3 className="font-semibold mb-1 line-clamp-1">{note.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
                <div className="flex justify-between items-start">
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => updateNote({ title: e.target.value })}
                    className="text-3xl font-bold border-none shadow-none p-0 focus-visible:ring-0"
                    placeholder="Note title..."
                  />
                  <Button variant="outline" size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Summarize
                  </Button>
                </div>

                <Textarea
                  value={selectedNote.content || ""}
                  onChange={(e) => updateNote({ content: e.target.value })}
                  className="min-h-[500px] resize-none border-none shadow-none text-lg p-0 focus-visible:ring-0"
                  placeholder="Start writing your note..."
                />

                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <span>Tags:</span>
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-md bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
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
    </div>
  );
};

export default Dashboard;
