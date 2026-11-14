import { AssistantProvider, AssistantThinkingLevel } from '@erxes/core-contract';
import { stored } from 'erxes-ui';
import { atom } from 'jotai';
import { z } from 'zod';

const AssistantTab = z.object({ key: z.string(), threadId: z.string().nullable() });

export type AssistantTab = z.infer<typeof AssistantTab>;

export const ASSISTANT_WIDTH = { default: 440, max: 1200 };

export const assistantOpenState = stored({
  key: 'erxes:assistant:open',
  schema: z.boolean(),
  initial: false,
});

export const assistantWidthState = stored({
  key: 'erxes:assistant:width',
  schema: z.number(),
  initial: ASSISTANT_WIDTH.default,
});

export const assistantTabsState = stored({
  key: 'erxes:assistant:tabs',
  schema: z.array(AssistantTab),
  initial: [],
});

export const assistantActiveTabState = stored({
  key: 'erxes:assistant:active-tab',
  schema: z.string().nullable(),
  initial: null,
});

export const assistantPickedModelState = stored({
  key: 'erxes:assistant:model',
  schema: z.object({
    provider: AssistantProvider.optional(),
    model: z.string().optional(),
    thinkingLevel: AssistantThinkingLevel.optional(),
  }),
  initial: {},
});

export const assistantUnreadState = atom(false);
