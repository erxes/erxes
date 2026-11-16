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

export const blankTab = (): AssistantTab => ({ key: crypto.randomUUID(), threadId: null });

/** Makes a blank chat the active tab: the open one, or a new one. */
export const newChatAction = atom(null, (get, set) => {
  const tabs = get(assistantTabsState);
  const blank = tabs.find((tab) => tab.threadId === null);

  if (blank) {
    set(assistantActiveTabState, blank.key);

    return;
  }

  const tab = blankTab();

  set(assistantTabsState, [...tabs, tab]);
  set(assistantActiveTabState, tab.key);
});

export const assistantUnreadState = atom(false);

/** A question asked from elsewhere (the top bar search), for a new chat to send. */
export const assistantAskState = atom<string | null>(null);

/** The asked question, cleared as it is read, so only one chat sends it. */
export const takeAskAction = atom(null, (get, set) => {
  const ask = get(assistantAskState);

  set(assistantAskState, null);

  return ask;
});

let composerFocusWanted = false;

export const wantComposerFocus = () => {
  composerFocusWanted = true;
};

export const takeComposerFocus = () => {
  const wanted = composerFocusWanted;

  composerFocusWanted = false;

  return wanted;
};
