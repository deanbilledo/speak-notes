"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaMicrophone, FaPause, FaStop } from "react-icons/fa";

interface Note {
  id: string;
  content: string;
  created: number;
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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
  
  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textAreaRef = useRef<HTMLDivElement | null>(null);

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

  // Voice recording functions
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      const newTranscript = final + interim;
      setTranscript(newTranscript);
      
      // Add the transcribed text to the current note content
      const currentText = text;
      const combinedText = currentText + (currentText && !currentText.endsWith(' ') && !currentText.endsWith('\n') ? ' ' : '') + newTranscript;
      setText(combinedText);
      
      // Update the textarea content
      if (textAreaRef.current) {
        textAreaRef.current.innerText = combinedText;
      }
    };
    
    recognition.onend = () => {
      setRecording(false);
      setPaused(false);
      setTranscript("");
    };
    
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setPaused(false);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
    setPaused(false);
    setTranscript("");
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setPaused(true);
    }
  };

  const resumeRecording = () => {
    if (!paused) return;
    startRecording();
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
          ref={textAreaRef}
          className="notebook-area"
          contentEditable
          suppressContentEditableWarning
          spellCheck={true}
          onInput={(e) => setText((e.target as HTMLDivElement).innerText)}
          data-placeholder="Write your note here or use voice recording..."
        >
          {text}
        </div>
        
        {/* Voice Recording Controls */}
        <div className="note-recorder-controls">
          {!recording && (
            <button
              className="note-recorder-btn note-recorder-btn-main"
              onClick={startRecording}
              onTouchStart={(e) => e.preventDefault()}
              aria-label="Start voice recording"
            >
              <FaMicrophone />
              <span>Record</span>
            </button>
          )}
          {recording && !paused && (
            <>
              <button
                className="note-recorder-btn note-recorder-btn-stop"
                onClick={stopRecording}
                onTouchStart={(e) => e.preventDefault()}
                aria-label="Stop recording"
              >
                <FaStop />
                <span>Stop</span>
              </button>
              <button
                className="note-recorder-btn note-recorder-btn-pause"
                onClick={pauseRecording}
                onTouchStart={(e) => e.preventDefault()}
                aria-label="Pause recording"
              >
                <FaPause />
                <span>Pause</span>
              </button>
            </>
          )}
          {recording && paused && (
            <button
              className="note-recorder-btn note-recorder-btn-main"
              onClick={resumeRecording}
              onTouchStart={(e) => e.preventDefault()}
              aria-label="Resume recording"
            >
              <FaMicrophone />
              <span>Resume</span>
            </button>
          )}
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
