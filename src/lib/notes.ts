import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";

export type Note = {
<<<<<<< HEAD
  id: string;
  title?: string;
=======
  id?: string;
>>>>>>> parent of d333f49 (Add typed notes, swipe-to-delete, and local storage support)
  text: string;
  createdAt: Date;
};

<<<<<<< HEAD

const NOTES_KEY = "speak_notes";


export async function saveNote(text: string, title?: string) {
  const notes = await getNotes();
  const defaultTitle = title || text.split(" ").slice(0, 5).join(" ");
  const note: Note = {
    id: Date.now().toString(),
    title: defaultTitle,
    text,
    createdAt: new Date(),
    noteType: "voice",
  };
  notes.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function saveTypedNote(text: string, title?: string) {
  const notes = await getNotes();
  const defaultTitle = title || text.split(" ").slice(0, 5).join(" ");
  const note: Note = {
    id: Date.now().toString(),
    title: defaultTitle,
    text,
    createdAt: new Date(),
    noteType: "text",
  };
  notes.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function updateNote(id: string, newTitle: string, newText: string) {
  const notes = await getNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notes[idx].title = newTitle;
    notes[idx].text = newText;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
=======
export async function saveNote(text: string) {
  await addDoc(collection(db, "notes"), {
    text,
    createdAt: serverTimestamp(),
  });
>>>>>>> parent of d333f49 (Add typed notes, swipe-to-delete, and local storage support)
}

export async function getNotes(): Promise<Note[]> {
  const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    text: doc.data().text,
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));
}
