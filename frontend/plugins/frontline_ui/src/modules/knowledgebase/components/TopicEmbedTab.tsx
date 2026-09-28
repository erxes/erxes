import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Badge, Button, InfoCard, toast } from 'erxes-ui';
import { TFunction } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { buildTopicEmbedScript } from '@/knowledgebase/utils/buildTopicEmbedScript';

export function TopicEmbedTab({
  topicId,
  t,
}: Readonly<{
  topicId: string;
  t: TFunction;
}>) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const script = buildTopicEmbedScript(topicId);

  const handleCopyScript = () => {
    navigator.clipboard
      .writeText(script)
      .then(() => {
        setCopied(true);
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), 3000);
        toast({
          title: t('kb-script-copied', 'Script copied to clipboard'),
          variant: 'success',
        });
      })
      .catch(() =>
        toast({
          title: t('error'),
          description: t('kb-script-copy-failed', 'Could not copy the script'),
          variant: 'destructive',
        }),
      );
  };

  return (
    <div className="flex flex-col gap-4">
      <InfoCard title={t('kb-embed-script')}>
        <InfoCard.Content className="gap-4">
          <p className="text-sm text-muted-foreground">
            {t('kb-embed-script-description')}
          </p>

          <div className="relative">
            <pre className="overflow-x-auto p-4 font-mono text-sm rounded-lg bg-muted">
              <code>{script}</code>
            </pre>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={handleCopyScript}
            >
              {copied ? (
                <>
                  <IconCheck className="mr-2 w-4 h-4" />
                  {t('copied')}
                </>
              ) : (
                <>
                  <IconCopy className="mr-2 w-4 h-4" />
                  {t('kb-copy-script')}
                </>
              )}
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
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
}
