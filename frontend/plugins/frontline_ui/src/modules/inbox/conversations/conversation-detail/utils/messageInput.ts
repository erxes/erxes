import type { Block } from '@blocknote/core';

type ConversationDraft = {
  blocks: Block[];
  internal?: boolean;
};

export const getConversationDraftKey = (conversationId: string) =>
  `frontline:conversation-draft:${conversationId}`;

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
