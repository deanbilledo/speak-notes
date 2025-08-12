"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

interface Note {
  id: string;
  content: string;
  created: number;
}

export default function NoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params?.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("notes");
    if (stored) {
      const notes: Note[] = JSON.parse(stored);
      const found = notes.find((n: Note) => n.id === noteId);
      if (found) {
        setNote(found);
        setText(found.content);
      }
    }
    setLoading(false);
  }, [noteId]);

  const handleSave = () => {
    if (!note) return;
    const stored = localStorage.getItem("notes");
    if (stored) {
      const notes: Note[] = JSON.parse(stored);
      const updated = notes.map((n: Note) => 
        n.id === noteId ? { ...n, content: text } : n
      );
      localStorage.setItem("notes", JSON.stringify(updated));
      window.dispatchEvent(new Event("notes-updated"));
    }
    router.push("/");
  };

  if (loading) return <div className="note-edit-loading">Loading...</div>;
  if (!note) return <div className="note-edit-loading">Note not found.</div>;

  return (
    <div className="note-edit-root">
      <button
        className="note-back-btn"
        onClick={() => router.push("/")}
        aria-label="Back"
      >
        <FaArrowLeft />
      </button>
      <div className="note-edit-content">
        <div
          className="notebook-area"
          contentEditable
          suppressContentEditableWarning
          spellCheck={true}
          onInput={(e) => setText((e.target as HTMLDivElement).innerText)}
          data-placeholder="Write your note here..."
        >
          {text}
        </div>
        <button
          className="note-save-btn"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
