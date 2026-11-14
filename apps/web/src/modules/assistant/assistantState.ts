import { AssistantProvider, AssistantThinkingLevel } from '@erxes/core-contract';
import { jsonOf } from 'erxes-ui';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { z } from 'zod';

const AssistantTab = z.object({ key: z.string(), threadId: z.string().nullable() });

export type AssistantTab = z.infer<typeof AssistantTab>;

const stored = <T>(key: string, schema: z.ZodType<T>, initial: T) =>
  atomWithStorage<T>(
    key,
    initial,
    {
      getItem: (name, fallback) => {
        const raw = localStorage.getItem(name);

        return raw === null ? fallback : (jsonOf(schema).safeParse(raw).data ?? fallback);
      },
      setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
      removeItem: (name) => localStorage.removeItem(name),
    },
    { getOnInit: true },
  );

export const ASSISTANT_WIDTH = { default: 440, max: 1200 };

export const assistantOpenState = stored('erxes:assistantOpen', z.boolean(), false);

export const assistantWidthState = stored(
  'erxes:assistantWidth',
  z.number(),
  ASSISTANT_WIDTH.default,
);

export const assistantTabsState = stored('erxes:assistantTabs', z.array(AssistantTab), []);

export const assistantActiveTabState = stored(
  'erxes:assistantActiveTab',
  z.string().nullable(),
  null,
);

export const assistantPickedModelState = stored(
  'erxes:assistantModel',
  z.object({
    provider: AssistantProvider.optional(),
    model: z.string().optional(),
    thinkingLevel: AssistantThinkingLevel.optional(),
  }),
  {},
);

export const assistantUnreadState = atom(false);
