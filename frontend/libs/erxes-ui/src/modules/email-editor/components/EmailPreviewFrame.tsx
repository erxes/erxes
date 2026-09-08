import { cn } from 'erxes-ui/lib';

export interface EmailPreviewFrameProps {
  html: string;
  className?: string;
}

export const EmailPreviewFrame = ({ html, className }: EmailPreviewFrameProps) => (
  <iframe
    title="Email preview"
    srcDoc={html}
    sandbox="allow-popups allow-popups-to-escape-sandbox"
    className={cn('w-full h-full border-0 bg-white', className)}
  />
);
