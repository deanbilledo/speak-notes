"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getNotes, updateNote, Note } from "@/lib/notes";
import Recorder from "@/components/Recorder";
import { FaArrowLeft } from "react-icons/fa";

export default function NoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params?.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  return (
    <div className="note-edit-root">
      {/* Back button top right */}
      <button
        className="note-back-btn"
        onClick={() => router.push("/")}
        aria-label="Back"
      >
        <FaArrowLeft />
      </button>
      {/* Recorder at the top */}
      <div className="note-edit-content">
        <Recorder
          onTranscript={(t: string) => setText((prev) => prev ? prev + " " + t : t)}
          initialTranscript={text}
        />
        <div
          className="notebook-area"
          contentEditable
          suppressContentEditableWarning
          spellCheck={true}
          onInput={e => setText((e.target as HTMLDivElement).innerText)}
          data-placeholder="Write your note here by hand or voice..."
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
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 31px, #e5e7eb 32px, #374151 32px)',
            lineHeight: '32px',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            whiteSpace: 'pre-wrap',
            outline: 'none',
          }}
          onInput={e => setText((e.target as HTMLDivElement).innerText)}
          data-placeholder="Write your note here by hand or voice..."
        >
          {text}
        </div>
        <button
          className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold text-[16px] shadow hover:bg-blue-600 transition-all border border-blue-600 mt-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-700"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
