import { sanitizePortalHtml } from '@/modules/ui/components/RichText';

/**
 * Renders the raw header or footer markup a help center stores in its
 * appearance tab. The HTML is author-written in the erxes admin, so it goes
 * through the same sanitiser as article bodies before reaching the DOM.
 */
export const PortalHtml = ({
  html,
  className,
}: {
  html: string | null;
  className?: string;
}) => {
  if (!html) {
    return null;
  }

  const clean = sanitizePortalHtml(html);

  if (!clean.trim()) {
    return null;
  }

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
};
