import { useTranslation } from 'react-i18next';
import { IconCopy, IconCheck, IconCode } from '@tabler/icons-react';
import { useState } from 'react';
import { Badge, Button, Dialog, toast } from 'erxes-ui';
import { REACT_APP_WIDGETS_URL } from '@/utils';
import { Link, useNavigate } from 'react-router';

type Props = {
  readonly integrationId: string;
};

export function EMInstallScript({ integrationId }: Props) {
  const { t } = useTranslation('frontline');
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
    const script = document.createElement("script");
    script.src = "${API}/messengerBundle.js";
    script.async = true;
    const entry = document.getElementsByTagName("script")[0];
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
          title: t('failed-to-copy-script'),
          description: t('please-try-again'),
          variant: 'destructive',
        });
      });
  };

  return (
    <>
      <div
        className="flex items-center gap-2 w-full cursor-pointer"
        onClick={() => setDialogOpen(true)}
        title={t('view-installation-script')}
      >
        <IconCode size={16} />
        {t('install-script')}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content className="max-w-2xl">
          <Dialog.Header>
            <Dialog.Title>{t('installation-script')}</Dialog.Title>
            <Dialog.Description>
              {t('installation-script-description')}
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
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4 mr-2" />
                    {t('copy')}
                  </>
                )}
              </Button>
            </div>

            <Badge variant="info" className="block w-full h-auto p-3">
              <h4 className="font-medium text-sm mb-2">{t('installation-steps')}</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>{t('installation-step-1')}</li>
                <li>{t('installation-step-2')}</li>
                <li>{t('installation-step-3')}</li>
                <li>{t('installation-step-4')}</li>
              </ol>
            </Badge>
          </div>

          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              {t('close')}
            </Button>
            <Button>
              <Link
                target="_blank"
                to={`/settings/frontline/channels/erxes-messenger-preview?inPreview=true&integrationId=${integrationId}`}
              >
                {t('preview')}
              </Link>
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
