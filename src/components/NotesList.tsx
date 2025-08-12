"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface NoteItem {
  id: string;
  content: string;
  created: number;
}

interface SwipeState {
  [key: string]: {
    startX: number;
    currentX: number;
    isDragging: boolean;
    showDelete: boolean;
    longPressTimer?: NodeJS.Timeout;
  };
}

const NotesList: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [swipeStates, setSwipeStates] = useState<SwipeState>({});
  const router = useRouter();
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
    console.log('Deleting note with id:', id); // Debug log
    console.log('Current notes:', notes); // Debug log
    
    const updated = notes.filter((n) => n.id !== id);
    console.log('Updated notes after filter:', updated); // Debug log
    
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
    window.dispatchEvent(new Event("notes-updated"));
    
    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // For very recent notes, show relative time
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    // For today's notes, show time
    if (diffDays < 1) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
    
    // For yesterday's notes
    if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
    
    // For this week's notes
    if (diffDays < 7) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      return `${dayName} at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
    
    // For older notes, show full date and time
    const isCurrentYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: isCurrentYear ? undefined : 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent, noteId: string) => {
    const touch = e.touches[0];
    
    // Set up long press timer for alternative delete method
    const longPressTimer = setTimeout(() => {
      if (confirm('Delete this note?')) {
        deleteNote(noteId);
      }
    }, 1000); // 1 second long press
    
    setSwipeStates(prev => ({
      ...prev,
      [noteId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isDragging: true,
        showDelete: prev[noteId]?.showDelete || false,
        longPressTimer
      }
    }));
    
    // Reset any existing transform transition
    const cardElement = cardRefs.current[noteId];
    if (cardElement) {
      cardElement.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent, noteId: string) => {
    const state = swipeStates[noteId];
    if (!state?.isDragging) return;

    // Clear long press timer if user starts moving
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - state.startX;
    const cardElement = cardRefs.current[noteId];
    
    // Only prevent default if we're actually swiping (moved more than 8px)
    if (Math.abs(deltaX) > 8) {
      e.preventDefault();
    }
    
    if (cardElement) {
      // Only allow left swipe (negative deltaX) with more range and smoother resistance
      let translateX = Math.min(0, deltaX);
      
      // Add elastic resistance beyond certain point
      if (translateX < -200) {
        const excess = Math.abs(translateX) - 200;
        translateX = -200 - (excess * 0.3); // Elastic effect
      }
      
      // Cap at maximum swipe distance
      translateX = Math.max(-250, translateX);
      
      cardElement.style.transform = `translateX(${translateX}px)`;
      cardElement.style.transition = 'none'; // Disable transition during drag
      
      setSwipeStates(prev => ({
        ...prev,
        [noteId]: {
          ...state,
          currentX: touch.clientX,
          showDelete: translateX < -100, // Show visual feedback when past delete threshold
          longPressTimer: undefined // Clear timer
        }
      }));
    }
  };

  const handleTouchEnd = (noteId: string) => {
    const state = swipeStates[noteId];
    if (!state?.isDragging) return;

    // Clear long press timer
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
    }

    const cardElement = cardRefs.current[noteId];
    const deltaX = state.currentX - state.startX;

    if (cardElement) {
      cardElement.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth transition
      
      if (deltaX < -120) {
        // Swiped far enough - delete the note automatically
        cardElement.style.transform = 'translateX(-400px)'; // Slide completely off screen
        
        // Delete the note after animation completes
        setTimeout(() => {
          deleteNote(noteId);
        }, 400);
      } else {
        // Snap back with smooth animation
        cardElement.style.transform = 'translateX(0px)';
        setSwipeStates(prev => ({
          ...prev,
          [noteId]: {
            ...state,
            isDragging: false,
            showDelete: false,
            longPressTimer: undefined
          }
        }));
      }
    }
  };

  const handleCardClick = (noteId: string) => {
    const state = swipeStates[noteId];
    const cardElement = cardRefs.current[noteId];
    
    // If card is swiped, reset it first, then navigate after animation
    if (state?.showDelete && cardElement) {
      cardElement.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      cardElement.style.transform = 'translateX(0px)';
      setSwipeStates(prev => ({
        ...prev,
        [noteId]: {
          ...state,
          showDelete: false
        }
      }));
      
      // Navigate after reset animation
      setTimeout(() => {
        router.push(`/note/${noteId}`);
      }, 200);
    } else {
      // Navigate immediately if not swiped
      router.push(`/note/${noteId}`);
    }
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
            className="note-card-container"
          >
            {/* Red delete background - always behind the card */}
            <div className={`note-delete-background ${swipeStates[note.id]?.showDelete ? 'delete-ready' : ''}`}>
              <div className={`delete-area ${swipeStates[note.id]?.showDelete ? 'delete-ready' : ''}`}>
                <FaTrash />
                <span>Delete</span>
              </div>
            </div>
            
            {/* Front card that slides over the delete background */}
            <div
              ref={el => { cardRefs.current[note.id] = el; }}
              className="note-card"
              onClick={() => handleCardClick(note.id)}
              onTouchStart={(e) => handleTouchStart(e, note.id)}
              onTouchMove={(e) => handleTouchMove(e, note.id)}
              onTouchEnd={() => handleTouchEnd(note.id)}
            >
              <div className="note-main-content">
                <div className="note-content">
                  {note.content.slice(0, 60) || "(No content)"}
                  {note.content.length > 60 && "..."}
                </div>
                <div className="note-date">
                  {formatDateTime(note.created)}
                </div>
              </div>
            </div>
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
