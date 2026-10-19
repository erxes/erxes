import { memo, useMemo } from 'react';
import { HtmlPreview } from './HtmlPreview';
import { replyToHtml } from './replyHtml';

/** Reply text can only render a reply. File controls belong to artifact parts. */
export const MessageContent = memo(({ content }: { content: string }) => {
  const html = useMemo(() => replyToHtml(content), [content]);
  return <HtmlPreview html={html} title="Assistant reply" references />;
});
