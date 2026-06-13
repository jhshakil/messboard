export interface NoteResponse {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  memberId: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    name: string;
  };
}

export interface CreateNoteDto {
  title: string;
  content: string;
  isPinned?: boolean;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  isPinned?: boolean;
}
