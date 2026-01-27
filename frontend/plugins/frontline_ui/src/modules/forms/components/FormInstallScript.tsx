import { IconCopy, IconCheck, IconCode } from '@tabler/icons-react';
import { useState } from 'react';
import { Badge, Button, Dialog, toast } from 'erxes-ui';
import { REACT_APP_WIDGETS_URL } from '@/utils';

type Props = {
  formId: string;
};

export function FormInstallScript({ formId }: Props) {
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const API = REACT_APP_WIDGETS_URL;
  const script = `<script>
  window.erxesSettings = {
    form: {
      formId: ${JSON.stringify(formId)},
    },
  };

  (function () {
    var script = document.createElement("script");
    script.src = "${API}/formBundle.js";
    script.async = true;
    var entry = document.getElementsByTagName("script")[0];
    entry.parentNode.insertBefore(script, entry);
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(script)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      })
      .catch(() => {
        toast({
          title: 'Failed to copy script',
          description: 'Please try again',
          variant: 'destructive',
        });
      });
  };

  return (
    <>
      <Button
        variant="outline"
        size={'icon'}
        onClick={() => setDialogOpen(true)}
        title="View installation script"
      >
        <IconCode />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content className="max-w-2xl">
          <Dialog.Header>
            <Dialog.Title>Installation Script</Dialog.Title>
            <Dialog.Description>
              Copy and paste this script into your website's HTML, just before
              the closing {'</body>'} tag.
            </Dialog.Description>
          </Dialog.Header>

          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{script}</code>
              </pre>
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
                    <IconCopy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <Badge variant="info" className="block w-full h-auto p-3">
              <h4 className="font-medium text-sm mb-2">Installation Steps:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Copy the script above</li>
                <li>Paste it into your website's HTML</li>
                <li>Place it just before the closing {'</body>'} tag</li>
                <li>The form widget will appear on your site</li>
              </ol>
            </Badge>
          </div>

          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
