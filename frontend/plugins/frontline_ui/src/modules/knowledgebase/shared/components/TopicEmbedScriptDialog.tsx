import { Button, Dialog } from 'erxes-ui';
import { TFunction } from 'i18next';
import { TopicEmbedScriptPanel } from '@/knowledgebase/shared/components/TopicEmbedScriptPanel';

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
          <TopicEmbedScriptPanel topicId={topicId} t={t} />
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
