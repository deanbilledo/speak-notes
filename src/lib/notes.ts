import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";

export type Note = {
  id?: string;
  text: string;
  createdAt: Date;
};

export async function saveNote(text: string) {
  await addDoc(collection(db, "notes"), {
    text,
    createdAt: serverTimestamp(),
  });
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
