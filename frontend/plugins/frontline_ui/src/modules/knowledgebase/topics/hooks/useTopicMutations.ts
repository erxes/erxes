import { useApolloClient, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import {
  ADD_TOPIC,
  EDIT_TOPIC,
  REMOVE_TOPIC,
} from '@/knowledgebase/graphql/mutations';
import { TOPICS, TOPIC_OPTIONS } from '@/knowledgebase/graphql/queries';
import { ITopicDoc } from '@/knowledgebase/types';
import { useKbToast } from '@/knowledgebase/shared/hooks/useKbToast';
import { withoutEmptyCode } from '@/knowledgebase/utils/withoutEmptyCode';

export const useSaveTopic = () => {
  const { t } = useTranslation('frontline');
  const { run } = useKbToast();

  const refetchQueries = [TOPICS, TOPIC_OPTIONS];

  const [addTopic, { loading: adding }] = useMutation(ADD_TOPIC, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const [editTopic, { loading: editing }] = useMutation(EDIT_TOPIC, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  // Resolves to the saved topic's id, or null when saving failed.
  const saveTopic = async (topicDoc: ITopicDoc, topicId?: string) => {
    let savedId: string | null = topicId ?? null;

    const saved = await run(
      async () => {
        const doc = withoutEmptyCode(topicDoc);

        if (topicId) {
          await editTopic({ variables: { _id: topicId, doc } });
        } else {
          const { data } = await addTopic({ variables: { doc } });
          savedId = data?.knowledgeBaseTopicsAdd?._id ?? null;
        }
      },
      topicId
        ? t('kb-topic-saved', 'Topic saved')
        : t('kb-topic-created', 'Topic created'),
    );

    return saved ? savedId : null;
  };

  return { saveTopic, loading: adding || editing };
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
