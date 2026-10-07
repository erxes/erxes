import {
  Avatar,
  Button,
  Dialog,
  EmailPreviewDevice,
  EmailPreviewDeviceToggle,
  EmailPreviewFrame,
} from 'erxes-ui';
import { useState } from 'react';

/**
 * The email this step sent, opened the way an inbox draws it — the same
 * preview a broadcast shows before it goes out.
 */
export const SendEmailResultEmailPreview = ({
  html,
  from,
  subject,
  to,
}: {
  html: string;
  from: string;
  subject: string;
  to: string;
}) => {
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="min-w-0 space-y-1.5">
      <h4 className="text-xs font-medium text-muted-foreground">
        Email content
      </h4>

      {/* A glimpse only; the dialog is where it is read. */}
      <div
        className="relative h-32 min-w-0 cursor-pointer overflow-hidden rounded-md border bg-white"
        onClick={() => setIsOpen(true)}
      >
        <EmailPreviewFrame html={html} className="pointer-events-none h-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-0 text-xs text-primary"
        onClick={() => setIsOpen(true)}
      >
        show more
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content className="flex h-[80vh] flex-col sm:max-w-3xl">
          <Dialog.Header>
            <Dialog.Title>Sent email</Dialog.Title>
          </Dialog.Header>

          <div className="flex items-start gap-3 border-b px-6 pb-4">
            <Avatar size="lg">
              <Avatar.Fallback>
                {(from || '?').charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {subject || '(no subject)'}
              </div>
              <div className="truncate text-sm text-muted-foreground">
                {from}
              </div>
              {to && (
                <div className="truncate text-sm text-muted-foreground">
                  to {to}
                </div>
              )}
            </div>

            <EmailPreviewDeviceToggle value={device} onChange={setDevice} />
          </div>

          <EmailPreviewFrame html={html} device={device} className="flex-1" />
        </Dialog.Content>
      </Dialog>
    </section>
  );
};
