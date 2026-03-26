import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, X } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";

interface UploadNoteModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadNoteModal({ open, onClose }: UploadNoteModalProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputId = useId();

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    const nameWithoutExt = f.name.replace(/\.[^.]+$/, "");
    setTitle(nameWithoutExt);
    if (f.type === "text/plain" || f.name.endsWith(".txt")) {
      const text = await f.text();
      setTextContent(text);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !file || !textContent.trim()) {
      toast.error("Please provide a file and note text content.");
      return;
    }
    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);
      const externalBlob = ExternalBlob.fromBytes(fileBytes);
      await actor.saveNote({
        title: title || file.name,
        externalBlob,
        mimeType: file.type || "application/octet-stream",
        filename: file.name,
        textContent,
      });
      toast.success("Note uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      handleClose();
    } catch (err) {
      toast.error("Failed to upload note. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setTextContent("");
    setFile(null);
    setIsDragOver(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="upload.dialog"
        className="max-w-lg w-full rounded-2xl p-0 overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground">
            Upload Note
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <label
              data-ocid="upload.dropzone"
              htmlFor={fileInputId}
              className={`
                block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
              `}
            >
              <input
                id={fileInputId}
                type="file"
                accept=".txt,.pdf,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                      setTextContent("");
                    }}
                    className="ml-auto p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Drop file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    .txt, .pdf, .png, .jpg, .jpeg
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              data-ocid="upload.input"
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="h-10 rounded-lg"
            />
          </div>

          {/* Text content */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-text" className="text-sm font-medium">
              Note text content <span className="text-destructive">*</span>
              <span className="text-muted-foreground font-normal ml-1">
                (required for AI features)
              </span>
            </Label>
            <Textarea
              data-ocid="upload.textarea"
              id="note-text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste or type your note content here..."
              className="min-h-[120px] rounded-lg resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              data-ocid="upload.cancel_button"
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              data-ocid="upload.submit_button"
              type="submit"
              className="flex-1 rounded-xl"
              disabled={isUploading || !file || !textContent.trim()}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Upload Note"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
