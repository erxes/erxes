import * as z from 'zod';

// The fields frontline's response template has. Imported templates keep
// what frontline stored, empty content included. The rules for a template
// someone writes are ResponseTemplateInput's.
export type IResponseTemplate = {
  name: string;
  content: string;
  channelId: string;
  files: string[];
  createdBy: string;
  // The frontline template this one came from. A second import updates it
  // instead of copying it again.
  sourceId?: string;
};

// What the create and edit forms send, checked again by the resolvers.
export const ResponseTemplateInput = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  // The composer's editor blocks as JSON, the format frontline stores.
  content: z.string().min(1, 'Content is required').max(100_000),
  channelId: z.string().min(1, 'Choose a channel'),
});
