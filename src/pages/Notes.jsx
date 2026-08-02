import React, { useState, useEffect } from "react";
import { Note } from "@/api/entities";
import { Project } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, StickyNote, Mic } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import NoteCard from "../components/notes/NoteCard";
import VoiceRecorder from "../components/notes/VoiceRecorder";

const EMPTY_FORM = {
  title: "",
  content: "",
  project_id: "",
  audio_url: null,
};

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [notesData, projectsData] = await Promise.all([
        Note.list(),
        Project.list(),
      ]);
      // Newest first
      setNotes([...notesData].reverse());
      setProjects(projectsData);
    } catch (err) {
      console.error("Błąd ładowania notatek:", err);
      setError("Nie udało się załadować notatek.");
    }
    setIsLoading(false);
  };

  const openDialog = () => {
    setForm(EMPTY_FORM);
    setShowVoice(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.content.trim() && !form.audio_url) return;
    setIsSaving(true);
    try {
      await Note.create({
        ...form,
        project_id: form.project_id || null,
        created_date: new Date().toISOString(),
      });
      trackProductEvent('notatka_dodana');
      setDialogOpen(false);
      await loadData();
    } catch (err) {
      console.error("Błąd zapisu notatki:", err);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    await Note.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const getProject = (projectId) =>
    projects.find((p) => p.id === projectId) || null;

  const handleTranscript = (text) => {
    if (!text) return;
    setForm((prev) => ({
      ...prev,
      content: prev.content ? prev.content + "\n" + text : text,
    }));
  };

  const handleAudioReady = (url) => {
    setForm((prev) => ({ ...prev, audio_url: url }));
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 md:mb-12 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
              Notatki
            </h1>
            <p className="text-base text-gray-500 font-normal mt-2">
              Szybkie notatki tekstowe i głosowe
            </p>
          </div>
          <Button
            onClick={openDialog}
            className="bg-black hover:bg-gray-800 text-white rounded-xl px-5 py-2.5 text-sm font-medium shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowa notatka
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <Button size="sm" variant="outline" onClick={loadData} className="ml-4 text-sm">
              Spróbuj ponownie
            </Button>
          </div>
        )}

        {/* Notes list */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="apple-blur rounded-2xl p-5">
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
          </div>
        ) : notes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                project={getProject(note.project_id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 apple-blur rounded-2xl apple-shadow">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <StickyNote className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-black mb-2">
              Brak notatek
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Dodaj pierwszą notatkę tekstową lub głosową
            </p>
            <Button
              onClick={openDialog}
              className="bg-black hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowa notatka
            </Button>
          </div>
        )}
      </div>

      {/* Create note dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black font-semibold">
              Nowa notatka
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <Input
              placeholder="Tytuł (opcjonalnie)"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="rounded-xl"
            />

            <Textarea
              placeholder="Treść notatki..."
              value={form.content}
              onChange={(e) =>
                setForm((p) => ({ ...p, content: e.target.value }))
              }
              rows={4}
              className="rounded-xl resize-none"
            />

            {/* Project link */}
            {projects.length > 0 && (
              <Select
                value={form.project_id || "none"}
                onValueChange={(val) =>
                  setForm((p) => ({
                    ...p,
                    project_id: val === "none" ? "" : val,
                  }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Powiąż z projektem (opcjonalnie)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez projektu</SelectItem>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Voice recorder toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowVoice((v) => !v)}
                className="flex items-center gap-2 text-sm text-blue-500 font-medium hover:text-blue-600 transition-colors"
              >
                <Mic className="w-4 h-4" />
                {showVoice ? "Ukryj nagrywanie" : "Nagraj głosowo"}
              </button>

              {showVoice && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <VoiceRecorder
                    onTranscript={handleTranscript}
                    onAudioReady={handleAudioReady}
                  />
                  {form.audio_url && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Nagrana audio:
                      </p>
                      <audio
                        controls
                        src={form.audio_url}
                        className="w-full"
                        style={{ height: "36px" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-xl"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || (!form.content.trim() && !form.audio_url)}
              className="bg-black hover:bg-gray-800 text-white rounded-xl"
            >
              {isSaving ? "Zapisuję..." : "Zapisz notatkę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
