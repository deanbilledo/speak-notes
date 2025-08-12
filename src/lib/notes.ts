export type Note = {
  id: string;
  text: string;
  createdAt: Date;
  noteType: "voice" | "text";
};

const NOTES_KEY = "speak_notes";


export async function saveNote(text: string) {
  const notes = await getNotes();
  const note: Note = {
    id: Date.now().toString(),
    text,
    createdAt: new Date(),
    noteType: "voice",
  };
  notes.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function saveTypedNote(text: string) {
  const notes = await getNotes();
  const note: Note = {
    id: Date.now().toString(),
    text,
    createdAt: new Date(),
    noteType: "text",
  };
  notes.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function updateNote(id: string, newText: string) {
  const notes = await getNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notes[idx].text = newText;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
}

export async function getNotes(): Promise<Note[]> {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try {
    const notes = JSON.parse(raw) as Note[];
    return notes.map((n) => ({ ...n, createdAt: new Date(n.createdAt) }));
  } catch {
    return [];
  }
}
