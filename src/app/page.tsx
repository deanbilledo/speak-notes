
import Recorder from "@/components/Recorder";
import NotesList from "@/components/NotesList";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 gap-6">
      <h1 className="text-2xl font-bold mt-4 mb-2">Speak Notes</h1>
      <Recorder />
      <NotesList />
    </main>
  );
}
