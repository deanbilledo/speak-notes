export type Note = {
  id: string;
  text: string;
  createdAt: Date;
};

const NOTES_KEY = "speak_notes";

export async function saveNote(text: string) {
  const notes = await getNotes();
  const note: Note = {
    id: Date.now().toString(),
    text,
    createdAt: new Date(),
  };
  notes.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
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
