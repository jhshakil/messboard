import api from "@/lib/axios";
import { CreateNoteDto, UpdateNoteDto, NoteResponse } from "@/types/note.types";

export const notesService = {
  getAll: () =>
    api.get<NoteResponse[]>("/notes").then((r) => r.data),

  create: (data: CreateNoteDto) =>
    api.post<NoteResponse>("/notes", data).then((r) => r.data),

  update: (id: string, data: UpdateNoteDto) =>
    api.patch<NoteResponse>(`/notes/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/notes/${id}`).then((r) => r.data),
};
