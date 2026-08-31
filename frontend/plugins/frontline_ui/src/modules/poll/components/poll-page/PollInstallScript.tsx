import { IconCheck, IconCode, IconCopy } from '@tabler/icons-react';
import { Button, Dialog, DropdownMenu, ScrollArea, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REACT_APP_WIDGETS_URL } from '@/utils';

const CopyButton = ({ text }: { text: string }) => {
  const { t } = useTranslation('frontline');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() =>
        toast({
          title: t('failed-to-copy', { label: 'script' }),
          description: t('please-try-again'),
          variant: 'destructive',
        }),
      );
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className="absolute top-2 right-2"
      onClick={handleCopy}
    >
      {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
    </Button>
  );
};

export const PollInstallScript = ({
  pollCode,
  channelId,
}: {
  pollCode?: string;
  channelId?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const script = `<script>
  window.erxesSettings = {
    polls: [
      {
        poll_id: '${pollCode || ''}',
        channel_id: '${channelId || ''}',
      },
    ],
  };

  (function () {
    var script = document.createElement('script');
    script.src = '${REACT_APP_WIDGETS_URL}/pollBundle.js';
    script.async = true;

    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
  })();
</script>`;

  const trigger = `data-erxes-poll="${pollCode || ''}"`;

  return (
    <>
      <DropdownMenu.Item
        onSelect={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        <IconCode />
        {t('install-script')}
      </DropdownMenu.Item>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="max-w-2xl">
          <Dialog.Header>
            <Dialog.Title>{t('poll-install-title')}</Dialog.Title>
            <Dialog.Description>
              {t('poll-install-description')}
            </Dialog.Description>
          </Dialog.Header>

          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-5 pr-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('poll-install-step-1')}</p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    <code>{script}</code>
                  </pre>
                  <CopyButton text={script} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">{t('poll-install-step-2')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('poll-install-step-2-note')}
                </p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    <code>{trigger}</code>
                  </pre>
                  <CopyButton text={trigger} />
                </div>
              </div>
            </div>
          </ScrollArea>

          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('close')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
