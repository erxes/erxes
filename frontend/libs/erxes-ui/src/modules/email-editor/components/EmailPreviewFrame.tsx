import { cn } from 'erxes-ui/lib';

export interface EmailPreviewFrameProps {
  /** Full HTML document, typically produced by the matching server-side renderEmailHtml() helper. */
  html: string;
  className?: string;
}

export const EmailPreviewFrame = ({ html, className }: EmailPreviewFrameProps) => (
  <iframe
    title="Email preview"
    srcDoc={html}
    sandbox=""
    className={cn('w-full h-full border-0 bg-white', className)}
  />
);
