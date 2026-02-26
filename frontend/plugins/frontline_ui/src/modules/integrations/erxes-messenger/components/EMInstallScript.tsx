import { IconCopy, IconCheck, IconCode } from '@tabler/icons-react';
import { useState } from 'react';
import { Badge, Button, Dialog, toast } from 'erxes-ui';
import { REACT_APP_WIDGETS_URL } from '@/utils';
import { Link, useNavigate } from 'react-router';

type Props = {
  integrationId: string;
};

export function EMInstallScript({ integrationId }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const API = REACT_APP_WIDGETS_URL;
  const script = `<script>
  window.erxesSettings = {
    messenger: {
      integrationId: ${JSON.stringify(integrationId)},
    },
  };

  (function () {
    var script = document.createElement("script");
    script.src = "${API}/messengerBundle.js";
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
      <div
        className="flex items-center gap-2 w-full cursor-pointer"
        onClick={() => setDialogOpen(true)}
        title="View installation script"
      >
        <IconCode size={16} />
        Install Script
      </div>

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
                <li>The messenger widget will appear on your site</li>
              </ol>
            </Badge>
          </div>

          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Link
              target="_blank"
              to={`/settings/frontline/channels/erxes-messenger-preview?inPreview=true&integrationId=${integrationId}`}
            >
              <Button>Preview</Button>
            </Link>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
