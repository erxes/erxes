import {
  getBlockAttachments,
  type IAttachment,
  useBlockEditor,
} from 'erxes-ui';

export type MessageEditor = ReturnType<typeof useBlockEditor>;
export type MessageEditorBlock = MessageEditor['document'][number];

const getMentionIdFromInline = (inline: unknown): string | undefined => {
  if (
    !inline ||
    typeof inline !== 'object' ||
    !('type' in inline) ||
    inline.type !== 'mention' ||
    !('props' in inline) ||
    !inline.props ||
    typeof inline.props !== 'object' ||
    !('_id' in inline.props) ||
    typeof inline.props._id !== 'string'
  ) {
    return undefined;
  }

  return inline.props._id;
};

export const stripHtml = (html: string): string => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.textContent || container.innerText || '';
};

export const getMessageMentionedUserIds = (
  blocks: MessageEditorBlock[],
): string[] =>
  blocks.flatMap((block) =>
    Array.isArray(block.content)
      ? block.content.flatMap((inline) => {
          const mentionId = getMentionIdFromInline(inline);
          return mentionId ? [mentionId] : [];
        })
      : [],
  );

export const encodeDiscordMentions = (
  blocks?: MessageEditorBlock[],
): MessageEditorBlock[] | undefined =>
  blocks?.map((block) =>
    Array.isArray(block?.content)
      ? ({
          ...block,
          content: block.content.map((inline) => {
            const mentionId = getMentionIdFromInline(inline);
            return mentionId
              ? {
                  type: 'text',
                  text: `{@discord:${mentionId}}`,
                  styles: {},
                }
              : inline;
          }),
        } as MessageEditorBlock)
      : block,
  );

export const getPlainTextFromHtml = (html?: string): string =>
  html?.replace(/<[^>]+>/g, '').trim() || '';

export const mergeMessageAttachments = (
  content: MessageEditorBlock[] | undefined,
  attachments: IAttachment[],
): IAttachment[] => {
  const blockAttachments = getBlockAttachments(content || []);
  const paperclipUrls = new Set(
    attachments.map((attachment) => attachment.url),
  );

  return [
    ...attachments,
    ...blockAttachments.filter(
      (attachment) => !paperclipUrls.has(attachment.url),
    ),
  ];
};
