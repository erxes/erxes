import { z } from 'zod';

/**
 * Meta restricts pages posting repetitive content, so a reply is stored as a
 * set of variants and one is picked per comment.
 */
export const commentActionFormSchema = z.object({
  texts: z
    .array(z.string().min(1, { message: 'Enter the reply text' }))
    .min(1, { message: 'Add at least one reply' }),
  attachments: z.any().optional(),
  mentionSender: z.boolean().optional(),
});

export type TCommentActionForm = z.infer<typeof commentActionFormSchema>;

/** Automations saved before variants existed carry a single `text`. */
export const toCommentActionFormValues = (config?: {
  text?: string;
  texts?: string[];
  attachments?: unknown;
  mentionSender?: boolean;
}): TCommentActionForm => {
  const texts = (config?.texts || []).filter((text) => Boolean(text?.trim()));

  return {
    texts: texts.length ? texts : [config?.text || ''],
    attachments: config?.attachments,
    // Tagging the commenter is opt-in: replies used to carry the mention
    // whether or not the automation wanted it.
    mentionSender: !!config?.mentionSender,
  };
};
