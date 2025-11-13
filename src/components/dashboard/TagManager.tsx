import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles } from "lucide-react";

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onGenerateTags: () => void;
  isGenerating: boolean;
}

export const TagManager = ({ tags, onTagsChange, onGenerateTags, isGenerating }: TagManagerProps) => {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      onTagsChange([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Tags</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateTags}
          disabled={isGenerating}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {isGenerating ? "Generating..." : "AI Suggest"}
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Add a tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
