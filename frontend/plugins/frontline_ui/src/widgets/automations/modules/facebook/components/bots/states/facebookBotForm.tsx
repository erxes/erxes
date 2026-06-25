import { z } from 'zod';

export const facebookBotFormSchema = z.object({
  accountId: z.string(),
  pageId: z.string(),
  name: z.string(),
  persistentMenus: z.array(
    z.object({
      _id: z.string(),
      text: z.string(),
      type: z.enum(['button', 'link', 'human_handoff', 'back_button']),
      link: z.string().optional(),
    }),
  ),
  tag: z.enum([
    'CONFIRMED_EVENT_UPDATE',
    'POST_PURCHASE_UPDATE',
    'ACCOUNT_UPDATE',
  ]),
  greetText: z.string().optional(),
  handoffMessage: z.string().optional(),
  automationActiveMessage: z.string().optional(),
  handoffPauseMinutes: z.coerce.number().min(1).default(10).optional(),
  isEnabledBackBtn: z.boolean().optional(),
  backButtonText: z.string().optional(),
});

export type TFacebookBotForm = z.infer<typeof facebookBotFormSchema>;
