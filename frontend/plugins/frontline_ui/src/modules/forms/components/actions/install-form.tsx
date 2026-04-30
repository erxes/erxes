import { IconCopy, IconCheck, IconCode } from '@tabler/icons-react';
import { useState } from 'react';
import {
  Badge,
  Button,
  cn,
  Dialog,
  DropdownMenu,
  ScrollArea,
  toast,
} from 'erxes-ui';
import { REACT_APP_WIDGETS_URL } from '@/utils';
import { Link } from 'react-router';

function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        toast({
          title: `Failed to copy ${label.toLowerCase()}`,
          description: 'Please try again',
          variant: 'destructive',
        });
      });
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className="absolute top-2 right-2"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <IconCheck className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <IconCopy className={cn({ 'mr-2': label !== '' }, 'w-4 h-4')} />
          {label}
        </>
      )}
    </Button>
  );
}

export function FormInstallScript({
  formId,
  channelId,
  inActionBar = false,
}: {
  formId: string;
  channelId: string;
  inActionBar?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const API = REACT_APP_WIDGETS_URL;
  const script = `<script>
  window.erxesSettings = {
    forms: [
      {
        form_id: '${formId}',
        channel_id: '${channelId}',
      },
    ],
  };

  (function () {
    const script = document.createElement('script');
    script.src = '${API}/formBundle.js';
    script.async = true;

    const entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
  })();
</script>`;

  const embed = `<div data-erxes-embed="${formId}"></div>`;
  const modal = `data-erxes-modal="${formId}"`;

  return (
    <>
      {inActionBar ? (
        <DropdownMenu.Item
          onSelect={(e) => {
            e.preventDefault();
            setDialogOpen(true);
          }}
        >
          <IconCode /> Install Script
        </DropdownMenu.Item>
      ) : (
        <Button
          variant="outline"
          size={'icon'}
          onClick={() => setDialogOpen(true)}
          title="View installation script"
        >
          <IconCode />
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="flex flex-col max-h-[75vh] overflow-hidden p-6 gap-4">
            <Dialog.Header>
              <Dialog.Title>Installation Guide</Dialog.Title>
              <Dialog.Description>
                Follow the steps below to embed this form on your website.
              </Dialog.Description>
            </Dialog.Header>

            <ScrollArea className="flex-1 min-h-0">
              <div className="gap-5 flex flex-col pr-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      1
                    </span>
                    <p className="text-sm font-medium">
                      Add the loader script to your HTML
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    Paste this snippet just before the closing{' '}
                    <code className="bg-muted px-1 rounded">{'</body>'}</code>{' '}
                    tag. It loads the form widget asynchronously without
                    blocking your page.
                  </p>
                  <div className="relative pl-7">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      <code>{script}</code>
                    </pre>
                    <CopyButton text={script} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      2
                    </span>
                    <p className="text-sm font-medium">
                      Place the embed element where the form should appear
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    Add this element anywhere in your page body. The form will
                    render inside it.
                  </p>
                  <div className="relative pl-7">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      <code>{embed}</code>
                    </pre>
                    <CopyButton text={embed} label="" />
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    If your form style is a popup, additionally paste this code
                    after the main code.
                  </p>
                  <div className="relative pl-7">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      <code>{modal}</code>
                    </pre>
                    <CopyButton text={modal} label="" />
                  </div>
                </div>

                <Badge variant="info" className="block w-full h-auto p-3">
                  <h4 className="font-medium text-sm mb-2">Quick checklist</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>
                      Loader script is placed before{' '}
                      <code className="bg-muted px-1 rounded">{'</body>'}</code>
                    </li>
                    <li>
                      Embed element is placed where you want the form to appear
                    </li>
                    <li>Both snippets are on the same page</li>
                    <li>Page is served over HTTPS (required for the widget)</li>
                  </ul>
                </Badge>
              </div>
            </ScrollArea>

            <Dialog.Footer>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button>
                <Link
                  target="_blank"
                  to={`/settings/frontline/forms/form-preview?inPreview=true&formId=${formId}`}
                >
                  Preview Form
                </Link>
              </Button>
            </Dialog.Footer>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
