import type { Block } from '@blocknote/core';

type ConversationDraft = {
  blocks: Block[];
  internal?: boolean;
};

export const composerStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Draft persistence is best-effort when storage is unavailable.
    }
  },
  removeItem: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Draft cleanup is best-effort when storage is unavailable.
    }
  },
};

const LEGACY_CONVERSATION_DRAFT_PREFIX = 'frontline:conversation-draft:';

export const clearLegacyConversationDrafts = (): void => {
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(LEGACY_CONVERSATION_DRAFT_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Legacy draft cleanup is best-effort when storage is unavailable.
  }
};

export const getConversationDraftKey = (
  userId: string,
  conversationId: string,
) => `${LEGACY_CONVERSATION_DRAFT_PREFIX}${userId}:${conversationId}`;

export const parseConversationDraft = (
  stored: string | null,
): ConversationDraft => {
  if (!stored) return { blocks: [] };

  const parsed: unknown = JSON.parse(stored);
  if (Array.isArray(parsed)) return { blocks: parsed as Block[] };
  if (!parsed || typeof parsed !== 'object') return { blocks: [] };

  const draft = parsed as Record<string, unknown>;
  return {
    blocks: Array.isArray(draft.blocks) ? (draft.blocks as Block[]) : [],
    internal: typeof draft.internal === 'boolean' ? draft.internal : undefined,
  };
};

export const encodeDiscordMentions = (blocks?: Block[]): Block[] | undefined =>
  blocks?.map((block) =>
    Array.isArray(block.content)
      ? ({
          ...block,
          content: block.content.map(
            (inline: { type?: string; props?: { _id?: string } }) =>
              inline.type === 'mention'
                ? {
                    type: 'text',
                    text: `{@discord:${inline.props?._id}}`,
                    styles: {},
                  }
                : inline,
          ),
        } as Block)
      : block,
  );
