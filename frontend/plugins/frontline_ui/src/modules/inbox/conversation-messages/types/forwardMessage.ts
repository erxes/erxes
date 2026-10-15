import { z } from 'zod';

export const forwardMessageSchema = z.object({
  destinationId: z.string().min(1, 'Choose a conversation'),
  note: z.string().trim().max(2_000, 'Note is too long'),
});

export type ForwardMessageForm = z.infer<typeof forwardMessageSchema>;

export type ForwardMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
