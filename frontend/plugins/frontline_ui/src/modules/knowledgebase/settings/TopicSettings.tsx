import { zodResolver } from '@hookform/resolvers/zod';
import { IconCode, IconTrash } from '@tabler/icons-react';
import { Button, Form, InfoCard, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { TopicEmbedScriptDialog } from '@/knowledgebase/shared/components/TopicEmbedScriptDialog';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import {
  EMPTY_TOPIC,
  TopicFormFields,
  topicSchema,
  topicToForm,
  TTopicForm,
} from '@/knowledgebase/topics/components/TopicFormFields';
import { useConfirmRemoveTopic } from '@/knowledgebase/topics/hooks/useConfirmRemoveTopic';
import { useSaveTopic } from '@/knowledgebase/topics/hooks/useTopicMutations';

export const TopicSettings = () => {
  const { t } = useTranslation('frontline');
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const { topic, loading, refetch } = useTopicDetail(topicId);
  const { saveTopic, loading: saving } = useSaveTopic();
  const { confirmRemoveTopic, loading: removing } = useConfirmRemoveTopic();
  const [scriptOpen, setScriptOpen] = useState(false);

  const form = useForm<TTopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: EMPTY_TOPIC,
  });

  useEffect(() => {
    if (topic) {
      form.reset(topicToForm(topic));
    }
  }, [topic, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveTopic(values, topicId);

    if (saved) {
      refetch();
    }
  });

  const handleDelete = () =>
    confirmRemoveTopic({ _id: topicId, title: topic?.title }, () =>
      navigate(KNOWLEDGE_BASE_PATH),
    );

  return (
    <KnowledgeBaseLayout
      topicId={topicId}
      topicTitle={topic?.title}
      section="kbsettings"
      actions={
        <Button
          onClick={submit}
          disabled={saving || loading}
          className="py-1 h-7"
        >
          {saving ? t('saving', 'Saving…') : t('save', 'Save')}
        </Button>
      }
    >
      {loading && !topic ? (
        <div className="flex justify-center items-center flex-auto">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-auto flex-auto p-4">
          <div className="grid gap-4 items-start lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Form {...form}>
              <form onSubmit={submit} className="grid gap-4">
                <TopicFormFields form={form} t={t} />
              </form>
            </Form>

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
      )}

      <TopicEmbedScriptDialog
        topicId={topicId}
        open={scriptOpen}
        onOpenChange={setScriptOpen}
        t={t}
      />
    </KnowledgeBaseLayout>
  );
};
