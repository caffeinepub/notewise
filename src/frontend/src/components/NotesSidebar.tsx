import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { NoteId, NoteMetadata } from "../backend";
import { useListNotes } from "../hooks/useQueries";
import { useDeleteNote } from "../hooks/useQueries";
import { UploadNoteModal } from "./UploadNoteModal";

interface NotesSidebarProps {
  selectedId: NoteId | null;
  onSelect: (id: NoteId) => void;
  onDeselect: () => void;
}

export function NotesSidebar({
  selectedId,
  onSelect,
  onDeselect,
}: NotesSidebarProps) {
  const { data: notes = [], isLoading } = useListNotes();
  const deleteNote = useDeleteNote();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<NoteId | null>(null);

  const handleDelete = async (e: React.MouseEvent, note: NoteMetadata) => {
    e.stopPropagation();
    try {
      await deleteNote.mutateAsync(note.id);
      toast.success("Note deleted");
      if (selectedId === note.id) onDeselect();
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const formatDate = (uploadDate: bigint) => {
    const ms = Number(uploadDate / 1_000_000n);
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <aside className="w-72 flex-shrink-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base">
              NoteWise
            </span>
          </div>
          <Button
            data-ocid="sidebar.primary_button"
            onClick={() => setUploadOpen(true)}
            className="w-full h-9 rounded-xl text-sm font-semibold gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Note
          </Button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-hidden">
          <div className="px-3 py-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
              My Notes
              {notes.length > 0 && (
                <span className="ml-2 text-foreground/60">
                  ({notes.length})
                </span>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <div
              data-ocid="sidebar.empty_state"
              className="px-4 py-8 text-center"
            >
              <FileText className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notes yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Upload your first note above
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="px-3 pb-4 flex flex-col gap-1">
                <AnimatePresence initial={false}>
                  {notes.map((note, i) => (
                    <motion.div
                      key={note.id.toString()}
                      data-ocid={`notes.item.${i + 1}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => onSelect(note.id)}
                      onMouseEnter={() => setHoveredId(note.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`
                        relative group p-3 rounded-xl cursor-pointer transition-colors
                        ${
                          selectedId === note.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-sidebar-accent border border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {note.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(note.uploadDate)}
                          </p>
                        </div>
                        <AnimatePresence>
                          {hoveredId === note.id && (
                            <motion.button
                              data-ocid={`notes.delete_button.${i + 1}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.1 }}
                              onClick={(e) => handleDelete(e, note)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                      {note.hasSummary && (
                        <Badge
                          variant="secondary"
                          className="mt-2 text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                        >
                          Summarized
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>
      </aside>

      <UploadNoteModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
