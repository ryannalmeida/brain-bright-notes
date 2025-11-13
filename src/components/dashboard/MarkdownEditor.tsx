import { useCallback, useMemo } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  const handleChange = useCallback(
    (value: string) => {
      onChange(value);
    },
    [onChange]
  );

  const options = useMemo(
    () => ({
      spellChecker: false,
      placeholder: "Start writing your note with markdown support...",
      status: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
      ],
      minHeight: "500px",
    }),
    []
  );

  return (
    <div className="markdown-editor">
      <SimpleMDE value={value} onChange={handleChange} options={options} />
    </div>
  );
};
