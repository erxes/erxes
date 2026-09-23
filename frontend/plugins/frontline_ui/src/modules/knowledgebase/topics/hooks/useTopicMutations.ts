import { useApolloClient, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ADD_TOPIC,
  EDIT_TOPIC,
  REMOVE_TOPIC,
} from '@/knowledgebase/graphql/mutations';
import { TOPICS, TOPIC_OPTIONS } from '@/knowledgebase/graphql/queries';
import { ITopic, ITopicDoc } from '@/knowledgebase/types';

export const useSaveTopic = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();

  const refetchQueries = [TOPICS, TOPIC_OPTIONS];

  const [addTopic, { loading: adding }] = useMutation(ADD_TOPIC, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const [editTopic, { loading: editing }] = useMutation(EDIT_TOPIC, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const saveTopic = async (doc: ITopicDoc, topicId?: string) => {
    try {
      if (topicId) {
        await editTopic({ variables: { _id: topicId, doc } });
      } else {
        await addTopic({ variables: { doc } });
      }

      toast({
        title: t('success'),
        description: topicId
          ? t('kb-topic-saved', 'Topic saved')
          : t('kb-topic-created', 'Topic created'),
        variant: 'success',
      });

      return true;
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('something-went-wrong'),
        variant: 'destructive',
      });

      return false;
    }
  };

  return { saveTopic, loading: adding || editing };
};

export const useEditTopicField = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [editTopic, { loading }] = useMutation(EDIT_TOPIC);

  const editTopicField = (topic: ITopic, patch: Partial<ITopicDoc>) =>
    editTopic({
      variables: {
        _id: topic._id,
        doc: {
          title: topic.title,
          description: topic.description,
          code: topic.code,
          brandId: topic.brandId ?? topic.brand?._id,
          color: topic.color,
          backgroundImage: topic.backgroundImage,
          languageCode: topic.languageCode,
          notificationSegmentId: topic.notificationSegmentId,
          ...patch,
        },
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return { editTopicField, loading };
};

export const useRemoveTopics = () => {
  const client = useApolloClient();
  const [removeTopic, { loading }] = useMutation(REMOVE_TOPIC);

  const removeTopics = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeTopic({
          variables: { _id },
          update: (cache) => {
            cache.evict({
              id: cache.identify({ __typename: 'KnowledgeBaseTopic', _id }),
            });
            cache.gc();
          },
        }),
      ),
    );

    await client.refetchQueries({ include: [TOPICS, TOPIC_OPTIONS] });
  };

  return { removeTopics, loading };
};
