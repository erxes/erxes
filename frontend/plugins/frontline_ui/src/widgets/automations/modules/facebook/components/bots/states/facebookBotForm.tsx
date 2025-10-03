import { z } from 'zod';

export const facebookBotFormSchema = z.object({
  accountId: z.string(),
  pageId: z.string(),
  name: z.string(),
  persistentMenus: z.array(
    z.object({
      _id: z.string(),
      text: z.string(),
      type: z.enum(['button', 'link']),
      link: z.string().optional(),
    }),
  ),
  tag: z.enum([
    'CONFIRMED_EVENT_UPDATE',
    'POST_PURCHASE_UPDATE',
    'ACCOUNT_UPDATE',
  ]),
  greetText: z.string().optional(),
  isEnabledBackBtn: z.boolean().optional(),
  backButtonText: z.string().optional(),
});

export type TFacebookBotForm = z.infer<typeof facebookBotFormSchema>;
