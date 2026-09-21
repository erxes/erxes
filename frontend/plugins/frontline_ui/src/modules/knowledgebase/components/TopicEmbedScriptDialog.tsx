import { Badge, Button, Dialog, toast } from 'erxes-ui';
import { TFunction } from 'i18next';
import { REACT_APP_WIDGETS_URL } from '@/utils';

export function TopicEmbedScriptDialog({
  topicId,
  open,
  onOpenChange,
  t,
}: Readonly<{
  topicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  t: TFunction;
}>) {
  const generateTopicScript = (topicId: string) => {
    const API = REACT_APP_WIDGETS_URL;
    return `<script>
    window.erxesSettings = {
      knowledgeBase: {
        topicId: ${JSON.stringify(topicId)},
      },
    };

    (function () {
      const script = document.createElement("script");
      script.src = "${API}/knowledgeBaseBundle.js";
      script.async = true;
      const entry = document.getElementsByTagName("script")[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  </script>`;
  };

  const handleCopyScript = (script: string) => {
    navigator.clipboard
      .writeText(script)
      .then(() =>
        toast({
          title: t('kb-script-copied', 'Script copied to clipboard'),
          variant: 'success',
        }),
      )
      .catch(() =>
        toast({
          title: t('error'),
          description: t('kb-script-copy-failed', 'Could not copy the script'),
          variant: 'destructive',
        }),
      );
  };

  const script = generateTopicScript(topicId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>{t('kb-embed-script-title')}</Dialog.Title>
          <Dialog.Description>
            {t('kb-embed-script-description')}
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-4">
          <div className="relative">
            <pre className="overflow-x-auto p-4 font-mono text-sm rounded-lg bg-muted">
              <code>{script}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => handleCopyScript(script)}
            >
              {t('kb-copy-script')}
            </Button>
          </div>

          <Badge variant="info" className="block p-3 w-full h-auto">
            <h4 className="mb-2 text-sm font-medium">
              {t('installation-steps')}
            </h4>
            <ol className="space-y-1 text-sm list-decimal list-inside text-muted-foreground">
              <li>{t('installation-step-1')}</li>
              <li>{t('installation-step-2')}</li>
              <li>{t('installation-step-3')}</li>
              <li>{t('kb-install-step-4')}</li>
            </ol>
          </Badge>
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
