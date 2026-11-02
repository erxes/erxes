import { IconCode, IconTrash } from '@tabler/icons-react';
import { Button, Empty, InfoCard, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useFrontlineTranslation } from '@/shared/i18n/useFrontlineTranslation';
import { useNavigate, useParams } from 'react-router-dom';
import {
  KB_RECORD_CONTENT_TYPES,
  KNOWLEDGE_BASE_PATH,
} from '@/knowledgebase/constants';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { TopicEmbedScriptDialog } from '@/knowledgebase/shared/components/TopicEmbedScriptDialog';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import { useSidePanel } from 'ui-modules';
import { useConfirmRemoveTopic } from '@/knowledgebase/topics/hooks/useConfirmRemoveTopic';

export const TopicSettings = () => {
  const { t } = useFrontlineTranslation('modules.knowledgebase');
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error } = useTopicDetail(topicId);
  const { openRecord } = useSidePanel();
  const { confirmRemoveTopic, loading: removing } = useConfirmRemoveTopic();
  const [scriptOpen, setScriptOpen] = useState(false);

  const openTopic = () =>
    openRecord({
      contentType: KB_RECORD_CONTENT_TYPES.topic,
      contentId: topicId,
    });

  const handleDelete = () =>
    confirmRemoveTopic({ _id: topicId, title: topic?.title }, () =>
      navigate(KNOWLEDGE_BASE_PATH),
    );

  const renderContent = () => {
    if (loading && !topic)
      return (
        <div className="flex justify-center items-center flex-auto">
          <Spinner />
        </div>
      );
    if (!topic)
      return (
        <Empty>
          <Empty.Header>
            <Empty.Title>{t('knowledge-base', 'Knowledge Base')}</Empty.Title>
            <Empty.Description>
              {error?.message ||
                t('kb-record-not-found', 'This record is no longer available.')}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      );
    return (
      <div className="overflow-auto flex-auto p-4">
        <div className="grid gap-4 items-start lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <InfoCard title={t('general', 'General')}>
            <InfoCard.Content>
              <p className="text-sm font-medium">{topic?.title}</p>
              {topic?.description && (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {topic.description}
                </p>
              )}
            </InfoCard.Content>
          </InfoCard>

          <div className="grid gap-4">
            <InfoCard title={t('kb-installation', 'Installation')}>
              <InfoCard.Content>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'kb-embed-script-description',
                    'Copy the script below to embed this knowledge base on your website.',
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-self-start"
                  onClick={() => setScriptOpen(true)}
                >
                  <IconCode className="mr-2 w-4 h-4" />
                  {t('kb-view-script', 'View script')}
                </Button>
              </InfoCard.Content>
            </InfoCard>

            <InfoCard title={t('kb-danger-zone', 'Danger zone')}>
              <InfoCard.Content className="border border-destructive/30">
                <p className="text-sm text-muted-foreground">
                  {t(
                    'kb-delete-topic-description',
                    'Deleting this topic removes all of its categories and articles.',
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-self-start text-destructive"
                  onClick={handleDelete}
                  disabled={removing}
                >
                  <IconTrash className="mr-2 w-4 h-4" />
                  {t('kb-delete-topic', 'Delete Topic')}
                </Button>
              </InfoCard.Content>
            </InfoCard>
          </div>
        </div>
      </div>
    );
  };

  return (
    <KnowledgeBaseLayout
      topicId={topicId}
      topicTitle={topic?.title ?? undefined}
      section="kbsettings"
      actions={
        <Button
          onClick={openTopic}
          disabled={loading || !topic}
          className="py-1 h-7"
        >
          {t('kb-edit-topic', 'Edit Topic')}
        </Button>
      }
    >
      {renderContent()}

      <TopicEmbedScriptDialog
        topicId={topicId}
        open={scriptOpen}
        onOpenChange={setScriptOpen}
        t={t}
      />
    </KnowledgeBaseLayout>
  );
};
