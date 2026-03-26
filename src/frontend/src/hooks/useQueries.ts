import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NoteId } from "../backend";
import { useActor } from "./useActor";

export function useListNotes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNote(id: NoteId | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["note", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getNote(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: NoteId) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useSummarizeNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: NoteId) => {
      if (!actor) throw new Error("Not connected");
      return actor.summarizeNote(noteId);
    },
    onSuccess: (_data, noteId) => {
      queryClient.invalidateQueries({ queryKey: ["note", noteId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useAskQuestion() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      noteId,
      question,
    }: { noteId: NoteId; question: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.askQuestion(noteId, question);
    },
  });
}
