import { Toaster } from "@/components/ui/sonner";
import { FileText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { NoteId } from "./backend";
import { LoginPage } from "./components/LoginPage";
import { NoteDetail } from "./components/NoteDetail";
import { NotesSidebar } from "./components/NotesSidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const [selectedNoteId, setSelectedNoteId] = useState<NoteId | null>(null);

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <NotesSidebar
        selectedId={selectedNoteId}
        onSelect={setSelectedNoteId}
        onDeselect={() => setSelectedNoteId(null)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedNoteId !== null ? (
            <NoteDetail
              key={selectedNoteId.toString()}
              noteId={selectedNoteId}
            />
          ) : (
            <motion.div
              key="empty"
              data-ocid="main.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Select a note to get started
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Pick a note from the sidebar, or upload a new one to summarize
                  and explore it with AI.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}
