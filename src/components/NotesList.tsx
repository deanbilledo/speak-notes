"use client";
import React from "react";

import { useEffect, useState } from "react";
import { getNotes, Note } from "@/lib/notes";

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotes().then((n) => {
      setNotes(n);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center text-gray-400">Loading notes...</div>;
  if (!notes.length) return <div className="text-gray-400 text-center">No notes yet.</div>;

  return (
    <div className="w-full mt-6 flex flex-col gap-2">
      {notes.map((note) => (
        <div key={note.id} className="bg-gray-100 rounded-lg p-3 shadow-sm">
          <div className="text-sm text-gray-700 whitespace-pre-line">{note.text}</div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            {note.createdAt.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
