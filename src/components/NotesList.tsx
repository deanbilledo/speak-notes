"use client";
import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getNotes, Note } from "@/lib/notes";

interface NoteItem {
  id: string;
  content: string;
  created: number;
}

const NotesList: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("notes");
    if (stored) setNotes(JSON.parse(stored));
    const handler = () => {
      const updated = localStorage.getItem("notes");
      if (updated) setNotes(JSON.parse(updated));
    };
    window.addEventListener("notes-updated", handler);
    return () => window.removeEventListener("notes-updated", handler);
  }, []);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now().toString(),
      content: newNote,
      created: Date.now(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
    setShowModal(false);
    setNewNote("");
    window.dispatchEvent(new Event("notes-updated"));
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
    window.dispatchEvent(new Event("notes-updated"));
  };

  return (
    <div className="noteslist-root">
      <div className="notes-list">
        {notes.length === 0 && (
          <div className="notes-empty">No notes yet.</div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            onClick={() => router.push(`/note/${note.id}`)}
          >
            <div className="note-content">
              {note.content.slice(0, 60) || "(No content)"}
            </div>
            <button
              className="delete-btn"
              onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
              aria-label="Delete note"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <button
        className="add-btn"
        onClick={() => setShowModal(true)}
        aria-label="Add note"
      >
        <FaPlus />
      </button>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <textarea
              className="modal-textarea"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Type your note..."
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-add"
                onClick={addNote}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesList;
