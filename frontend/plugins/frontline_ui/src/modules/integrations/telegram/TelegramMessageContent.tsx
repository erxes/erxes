import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Skeleton } from 'erxes-ui';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import type { IMessageEmbed } from '@/inbox/types/Conversation';

const TELEGRAM_MESSAGE_LINK_PREVIEWS = gql`
  query frontlineTelegramMessageLinkPreviews($messageId: String!) {
    telegramMessageLinkPreviews(messageId: $messageId)
  }
`;

// Match the server preview's punctuation handling without quadratic rescans.
const trimLinkPunctuation = (value: string): string => {
  let end = value.length;
  while (end > 0 && '.,!?;:'.includes(value[end - 1])) end--;
  let extraClosing = 0;
  for (let index = 0; index < end; index++) {
    if (value[index] === ')') extraClosing++;
    if (value[index] === '(') extraClosing--;
  }
  while (end > 0 && value[end - 1] === ')' && extraClosing > 0) {
    end--;
    extraClosing--;
  }
  return value.slice(0, end);
};

// Historical Telegram messages contain escaped text, while outbound messages
// already contain editor HTML. Only linkify text nodes; never replace markup or
// nest links. Code stays literal, and BlockEditorReadOnly remains the renderer.
export const linkifyTelegramContent = (
  content: string,
): { html: string; hasLinks: boolean } => {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (
      node instanceof Text &&
      !node.parentElement?.closest('a,code,pre,script,style')
    )
      nodes.push(node);
    node = walker.nextNode();
  }
  for (const text of nodes) {
    const value = text.textContent || '';
    const fragment = doc.createDocumentFragment();
    let cursor = 0;
    for (const match of value.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
      const url = trimLinkPunctuation(match[0]);
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        continue;
      }
      fragment.append(value.slice(cursor, match.index));
      const link = doc.createElement('a');
      link.href = parsedUrl.href;
      link.textContent = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      fragment.append(link);
      cursor = (match.index || 0) + url.length;
    }
    if (cursor) {
      fragment.append(value.slice(cursor));
      text.replaceWith(fragment);
    }
  }
  return {
    html: doc.body.innerHTML,
    hasLinks: Boolean(
      doc.body.querySelector('a[href^="https://"],a[href^="http://"]'),
    ),
  };
};

/** Loads authorized link cards while retaining the original message link on failure. */
export const TelegramLinkPreviews = ({
  messageId,
  content,
}: {
  messageId: string;
  content: string;
}) => {
  const { hasLinks } = useMemo(
    () => linkifyTelegramContent(content),
    [content],
  );
  const { data, loading } = useQuery<{
    telegramMessageLinkPreviews: IMessageEmbed[];
  }>(TELEGRAM_MESSAGE_LINK_PREVIEWS, {
    variables: { messageId },
    fetchPolicy: 'cache-and-network',
    skip: !hasLinks,
  });
  if (!hasLinks) return null;
  if (loading && !data)
    return (
      <Skeleton
        className="mt-2 h-16 w-full"
        aria-label="Loading link preview"
      />
    );
  // The message's link remains usable when its website cannot supply a preview.
  return <MessageEmbeds embeds={data?.telegramMessageLinkPreviews} />;
};

/** Linkifies literal provider URLs before using the native message renderer. */
export const TelegramMessageContent = ({ content }: { content: string }) => {
  const { html } = useMemo(() => linkifyTelegramContent(content), [content]);
  return <MessageContent content={html} />;
};
