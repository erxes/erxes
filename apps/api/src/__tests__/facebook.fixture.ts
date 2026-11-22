import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { makeDue, settle } from './settle';

export const GRAPH = 'https://graph.facebook.com/v23.0';

export const APP_ID = '1234567890';

export const APP_SECRET = 'fb-app-secret';

export const PAGE = '111';

export const AppSubscription = z.object({
  object: z.string(),
  callback_url: z.string(),
  verify_token: z.string(),
  fields: z.string(),
});

export const entry = (page: string, changes: unknown[]) =>
  JSON.stringify({ object: 'page', entry: [{ id: page, time: 1_763_800_000, changes }] });

export const comment = (id: string, from: string) =>
  entry(PAGE, [
    {
      field: 'feed',
      value: {
        item: 'comment',
        verb: 'add',
        comment_id: id,
        post_id: `${PAGE}_9`,
        message: 'How much is it?',
        from: { id: from, name: 'Someone' },
        created_time: 1_763_800_000,
      },
    },
  ]);

export const matches = (path: string, value: string) => ({
  id: 'check',
  type: 'branch' as const,
  conditions: { match: 'all' as const, rules: [{ path, op: 'eq' as const, value }] },
  then: [{ id: 'wait', type: 'delay' as const, amount: 1, unit: 'days' as const }],
  else: [],
});

export const settleRetries = () =>
  inOrder([1, 2, 3, 4], async () => {
    await makeDue();
    await settle();
  });
