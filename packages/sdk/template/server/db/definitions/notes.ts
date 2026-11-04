import * as z from 'zod';

export type INote = {
  text: string;
  createdBy: string;
};

// What the add form sends, checked again by the resolver.
export const NoteInput = z.object({
  text: z.string().trim().min(1, 'Write something').max(2000),
});
