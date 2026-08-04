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
import { useTranslation } from 'react-i18next';

function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string;
  label?: string;
}) {
  const { t } = useTranslation('frontline');
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
          title: t('failed-to-copy', { label: label.toLowerCase() }),
          description: t('please-try-again'),
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
          {t('copied')}
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
  const { t } = useTranslation('frontline');
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
    var script = document.createElement('script');
    script.src = '${API}/formBundle.js';
    script.async = true;

    var entry = document.getElementsByTagName('script')[0];
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
          <IconCode /> {t('install-script')}
        </DropdownMenu.Item>
      ) : (
        <Button
          variant="outline"
          size={'icon'}
          onClick={() => setDialogOpen(true)}
          title={t('view-installation-script')}
        >
          <IconCode />
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="flex flex-col max-h-[75vh] overflow-hidden p-6 gap-4">
            <Dialog.Header>
              <Dialog.Title>{t('installation-guide')}</Dialog.Title>
              <Dialog.Description>
                {t('installation-guide-description')}
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
                      {t('install-step-1-title')}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    {t('install-step-1-description')}
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
                      {t('install-step-2-title')}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    {t('install-step-2-description')}
                  </p>
                  <div className="relative pl-7">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      <code>{embed}</code>
                    </pre>
                    <CopyButton text={embed} label="" />
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    {t('install-step-2-popup-note')}
                  </p>
                  <div className="relative pl-7">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      <code>{modal}</code>
                    </pre>
                    <CopyButton text={modal} label="" />
                  </div>
                </div>

                <Badge variant="info" className="block w-full h-auto p-3">
                  <h4 className="font-medium text-sm mb-2">{t('quick-checklist')}</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>{t('checklist-loader-script')}</li>
                    <li>{t('checklist-embed-element')}</li>
                    <li>{t('checklist-same-page')}</li>
                    <li>{t('checklist-https')}</li>
                  </ul>
                </Badge>
              </div>
            </ScrollArea>

            <Dialog.Footer>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                {t('close')}
              </Button>
              <Button>
                <Link
                  target="_blank"
                  to={`/settings/frontline/forms/form-preview?inPreview=true&formId=${formId}`}
                >
                  {t('preview-form')}
                </Link>
              </Button>
            </Dialog.Footer>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
