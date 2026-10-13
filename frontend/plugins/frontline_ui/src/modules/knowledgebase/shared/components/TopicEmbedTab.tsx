import { InfoCard } from 'erxes-ui';
import { TFunction } from 'i18next';
import { TopicEmbedScriptPanel } from '@/knowledgebase/shared/components/TopicEmbedScriptPanel';

export function TopicEmbedTab({
  topicId,
  t,
}: Readonly<{
  topicId: string;
  t: TFunction;
}>) {
  return (
    <div className="flex flex-col gap-4">
      <InfoCard title={t('kb-embed-script')}>
        <InfoCard.Content className="gap-4">
          <p className="text-sm text-muted-foreground">
            {t('kb-embed-script-description')}
          </p>
          <TopicEmbedScriptPanel topicId={topicId} t={t} />
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
}
