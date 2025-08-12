"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { getNotes, Note, saveTypedNote, updateNote } from "@/lib/notes";




export default function NotesList() {
  // All hooks must be called before any early returns
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  // Swipe-to-delete state
  const [swipeStates, setSwipeStates] = useState<{ [id: string]: number }>({});
  const [deleting, setDeleting] = useState<{ [id: string]: boolean }>({});
  const touchStartX = useRef<{ [id: string]: number }>({});

  useEffect(() => {
    setNotes([]);
    setLoading(true);
    getNotes().then((n) => {
      setNotes(n);
      setLoading(false);
    });
    // Listen for storage changes (other tabs)
    const onStorage = () => {
      getNotes().then(setNotes);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleAddTypedNote = async () => {
    if (!input.trim()) return;
    await saveTypedNote(input.trim());
    setInput("");
    setShowInput(false);
    setLoading(true);
    getNotes().then((n) => {
      setNotes(n);
      setLoading(false);
    });
  };

  const handleEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const handleSaveEdit = async (id: string) => {
    await updateNote(id, editValue);
    setEditingId(null);
    setEditValue("");
    setLoading(true);
    getNotes().then((n) => {
      setNotes(n);
      setLoading(false);
    });
  };


  if (loading) return <div className="text-center text-gray-400">Loading notes...</div>;


  // (removed duplicate declarations below)

  // Delete note
  const handleDelete = async (id: string) => {
    const notes = await getNotes();
    const filtered = notes.filter((n) => n.id !== id);
    localStorage.setItem("speak_notes", JSON.stringify(filtered));
    setNotes(filtered);
  };

  const onTouchStart = (id: string) => (e: React.TouchEvent) => {
    touchStartX.current[id] = e.changedTouches[0].clientX;
    setSwipeStates((prev) => ({ ...prev, [id]: 0 }));
  };
  const onTouchMove = (id: string) => (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - (touchStartX.current[id] || 0);
    if (delta < 0) {
      setSwipeStates((prev) => ({ ...prev, [id]: Math.max(delta, -120) }));
    }
  };
  const onTouchEnd = (id: string) => (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - (touchStartX.current[id] || 0);
    if (delta < -60) {
      setSwipeStates((prev) => ({ ...prev, [id]: -160 }));
      setDeleting((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        handleDelete(id);
        setSwipeStates((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        setDeleting((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }, 250);
    } else {
      setSwipeStates((prev) => ({ ...prev, [id]: 0 }));
    }
    delete touchStartX.current[id];
  };

  return (
    <div className="w-full mt-6 flex flex-col gap-2 relative min-h-[60vh]">
      {/* Floating Add Button */}
      <button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg text-2xl hover:bg-blue-600 focus:outline-none"
        onClick={() => setShowInput(true)}
        aria-label="Add Typed Note"
      >
        <FaPlus />
      </button>
      {/* Modal for input */}
      {showInput && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md mx-auto mb-8 shadow-lg flex flex-col gap-2">
            <textarea
              className="w-full border rounded p-2"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your note..."
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => { setShowInput(false); setInput(""); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleAddTypedNote}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {!notes.length && <div className="text-gray-400 text-center">No notes yet.</div>}
      {notes.map((note) => (
        <div
          key={note.id}
          className="relative overflow-hidden mb-2"
          style={{ height: deleting[note.id] ? 0 : undefined, transition: 'height 0.25s' }}
        >
          <div className="absolute inset-0 flex items-center justify-end pr-6 bg-red-100 z-0 rounded-2xl">
            <FaTrash className="text-red-500 text-xl" />
          </div>
          <div
            className="bg-gray-100 rounded-2xl p-3 shadow-sm relative z-10"
            style={{
              transform: `translateX(${swipeStates[note.id] || 0}px)`,
              transition: deleting[note.id] ? 'transform 0.25s, opacity 0.25s' : 'transform 0.2s',
              opacity: deleting[note.id] ? 0 : 1,
            }}
            onTouchStart={onTouchStart(note.id)}
            onTouchMove={onTouchMove(note.id)}
            onTouchEnd={onTouchEnd(note.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">
                {note.noteType === "voice" ? "🎤 Voice" : "✍️ Typed"}
              </span>
              <span className="text-xs text-gray-400">{note.createdAt.toLocaleString()}</span>
            </div>
            {editingId === note.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full border rounded p-2"
                  rows={2}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  className="self-end px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => handleSaveEdit(note.id)}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-line">{note.text}</div>
            )}
            {editingId !== note.id && (
              <button
                className="mt-2 text-xs text-blue-500 hover:underline"
                onClick={() => handleEdit(note.id, note.text)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
