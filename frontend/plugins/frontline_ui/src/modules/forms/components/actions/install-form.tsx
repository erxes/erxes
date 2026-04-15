import { IconCopy, IconCheck, IconCode } from '@tabler/icons-react';
import { useState } from 'react';
import { Badge, Button, Dialog, DropdownMenu, toast } from 'erxes-ui';
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
      className="top-2 right-2 absolute"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <IconCheck className="mr-2 w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <IconCopy className="mr-2 w-4 h-4" />
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
        <Dialog.Content className="max-w-2xl">
          <Dialog.Header>
            <Dialog.Title>Installation Guide</Dialog.Title>
            <Dialog.Description>
              Follow the steps below to embed this form on your website.
            </Dialog.Description>
          </Dialog.Header>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex justify-center items-center bg-primary rounded-full w-5 h-5 font-bold text-primary-foreground text-xs shrink-0">
                  1
                </span>
                <p className="font-medium text-sm">
                  Add the loader script to your HTML
                </p>
              </div>
              <p className="pl-7 text-muted-foreground text-xs">
                Paste this snippet just before the closing{' '}
                <code className="bg-muted px-1 rounded">{'</body>'}</code> tag.
                It loads the form widget asynchronously without blocking your
                page.
              </p>
              <div className="relative pl-7">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm">
                  <code>{script}</code>
                </pre>
                <CopyButton text={script} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex justify-center items-center bg-primary rounded-full w-5 h-5 font-bold text-primary-foreground text-xs shrink-0">
                  2
                </span>
                <p className="font-medium text-sm">
                  Place the embed element where the form should appear
                </p>
              </div>
              <p className="pl-7 text-muted-foreground text-xs">
                Add this element anywhere in your page body. The form will
                render inside it.
              </p>
              <div className="relative pl-7">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm">
                  <code>{embed}</code>
                </pre>
                <CopyButton text={embed} label="Copy embed code" />
              </div>
            </div>

            <Badge variant="info" className="block p-3 w-full h-auto">
              <h4 className="mb-2 font-medium text-sm">Quick checklist</h4>
              <ul className="space-y-1 text-muted-foreground text-sm list-disc list-inside">
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
        </Dialog.Content>
      </Dialog>
    </>
  );
}
