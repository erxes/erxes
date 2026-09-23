import type { MessageInputBlocks } from '@/inbox/conversations/conversation-detail/types/messageInput';

export const encodeDiscordMentions = (
  blocks?: MessageInputBlocks,
): MessageInputBlocks | undefined =>
  blocks?.map((block) =>
    Array.isArray(block?.content)
      ? ({
          ...block,
          content: block.content.map((inline) =>
            inline.type === 'mention' &&
            'props' in inline &&
            '_id' in inline.props
              ? {
                  type: 'text',
                  text: `{@discord:${inline.props?._id}}`,
                  styles: {},
                }
              : inline,
          ),
        } as MessageInputBlocks[number])
      : block,
  );
