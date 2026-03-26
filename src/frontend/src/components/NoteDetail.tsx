import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bot, FileText, Loader2, Send, Sparkles, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { NoteId } from "../backend";
import {
  useAskQuestion,
  useGetNote,
  useSummarizeNote,
} from "../hooks/useQueries";

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

interface NoteDetailProps {
  noteId: NoteId;
}

export function NoteDetail({ noteId }: NoteDetailProps) {
  const { data: note, isLoading } = useGetNote(noteId);
  const summarize = useSummarizeNote();
  const askQuestion = useAskQuestion();
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const handleSummarize = async () => {
    try {
      await summarize.mutateAsync(noteId);
      toast.success("Summary generated!");
    } catch {
      toast.error("Failed to generate summary. Please try again.");
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = currentQuestion.trim();
    if (!q) return;
    setCurrentQuestion("");
    try {
      const answer = await askQuestion.mutateAsync({ noteId, question: q });
      setQaPairs((prev) => [
        ...prev,
        { id: `${Date.now()}`, question: q, answer },
      ]);
    } catch {
      toast.error("Failed to get answer. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div
        data-ocid="note.loading_state"
        className="flex-1 p-8 flex flex-col gap-4"
      >
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-40 rounded-lg" />
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
          <Skeleton className="h-4 w-4/6 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div
        data-ocid="note.error_state"
        className="flex-1 flex items-center justify-center"
      >
        <p className="text-muted-foreground">Note not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      key={noteId.toString()}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      {/* Note header */}
      <div className="px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{note.title}</h2>
            <p className="text-sm text-muted-foreground">{note.filename}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="summary"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-8 pt-4">
          <TabsList className="rounded-xl">
            <TabsTrigger
              data-ocid="note.tab"
              value="summary"
              className="rounded-lg text-sm"
            >
              Summary
            </TabsTrigger>
            <TabsTrigger
              data-ocid="note.tab"
              value="ask"
              className="rounded-lg text-sm"
            >
              Ask a Doubt
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Summary tab */}
        <TabsContent value="summary" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="px-8 py-6">
              {note.summary ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose max-w-none"
                >
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        AI Summary
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                      {note.summary}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div
                  data-ocid="summary.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    No summary yet
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                    Generate an AI-powered summary to quickly understand the key
                    points of your note.
                  </p>
                  <Button
                    data-ocid="summary.primary_button"
                    onClick={handleSummarize}
                    disabled={summarize.isPending}
                    className="rounded-xl px-6 gap-2"
                  >
                    {summarize.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                  {summarize.isPending && (
                    <p
                      data-ocid="summary.loading_state"
                      className="text-xs text-muted-foreground mt-3"
                    >
                      This may take a few seconds...
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Ask a Doubt tab */}
        <TabsContent
          value="ask"
          className="flex-1 flex flex-col overflow-hidden mt-0"
        >
          <ScrollArea className="flex-1">
            <div className="px-8 py-6 flex flex-col gap-4 min-h-full">
              {qaPairs.length === 0 && !askQuestion.isPending ? (
                <div
                  data-ocid="chat.empty_state"
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Ask anything about this note
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Type your doubt below and get an AI-powered answer.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {qaPairs.map((pair, i) => (
                    <motion.div
                      key={pair.id}
                      data-ocid={`chat.item.${i + 1}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-3"
                    >
                      {/* User question */}
                      <div className="flex justify-end">
                        <div className="flex items-end gap-2 max-w-[75%]">
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                            {pair.question}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-secondary-foreground" />
                          </div>
                        </div>
                      </div>
                      {/* AI answer */}
                      <div className="flex justify-start">
                        <div className="flex items-end gap-2 max-w-[75%]">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed text-foreground">
                            {pair.answer}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {askQuestion.isPending && (
                    <motion.div
                      data-ocid="chat.loading_state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-end gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((d) => (
                              <span
                                key={d}
                                className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
                                style={{ animationDelay: `${d * 0.15}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="px-8 py-4 border-t border-border">
            <form
              data-ocid="chat.panel"
              onSubmit={handleAsk}
              className="flex gap-3 items-end"
            >
              <Textarea
                data-ocid="chat.textarea"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Type your doubt here... (Enter to send)"
                className="flex-1 min-h-[42px] max-h-[120px] resize-none rounded-xl text-sm"
                disabled={askQuestion.isPending}
              />
              <Button
                data-ocid="chat.submit_button"
                type="submit"
                size="icon"
                className="w-10 h-10 rounded-xl flex-shrink-0"
                disabled={askQuestion.isPending || !currentQuestion.trim()}
              >
                {askQuestion.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
