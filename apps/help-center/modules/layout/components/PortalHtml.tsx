import { sanitizePortalHtml } from '@/modules/ui/components/RichText';

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
