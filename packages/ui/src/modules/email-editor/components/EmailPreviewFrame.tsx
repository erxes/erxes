import { cn } from 'erxes-ui/lib';
import { EmailPreviewDevice } from '../types';

export interface EmailPreviewFrameProps {
  html: string;
  className?: string;
  /** The width the email is read at. Mobile is where most of it is read. */
  device?: EmailPreviewDevice;
}

export const EmailPreviewFrame = ({
  html,
  className,
  device = 'desktop',
}: EmailPreviewFrameProps) => (
  <div
    className={cn(
      'flex min-h-0 w-full justify-center',
      device === 'mobile' && 'bg-muted/40 p-4',
      className,
    )}
  >
    <iframe
      title="Email preview"
      srcDoc={html}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      className={cn(
        'h-full border-0 bg-white',
        device === 'mobile'
          ? 'w-[390px] max-w-full rounded-xl border shadow-sm'
          : 'w-full',
      )}
    />
  </div>
);
