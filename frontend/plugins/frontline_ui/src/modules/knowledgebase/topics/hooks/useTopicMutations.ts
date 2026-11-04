import { useApolloClient, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { KB_RECORD_CONTENT_TYPES } from '@/knowledgebase/constants';
import { useKbCloseRemovedRecord } from '@/knowledgebase/shared/hooks/useKbCloseRemovedRecord';
import {
  ADD_TOPIC,
  EDIT_TOPIC,
  REMOVE_TOPIC,
} from '@/knowledgebase/graphql/mutations';
import {
  TOPICS,
  TOPIC_OPTIONS,
  TOPIC_DETAIL,
} from '@/knowledgebase/graphql/queries';
import { ITopicDoc } from '@/knowledgebase/types';
import { useKbToast } from '@/knowledgebase/shared/hooks/useKbToast';
import { withoutEmptyCode } from '@/knowledgebase/utils/withoutEmptyCode';
import type { FieldNamesMarkedBoolean } from 'react-hook-form';
import type { KnowledgeBaseTopicDoc } from '~/gql/graphql';

/** Saves topic documents and returns their persistent identifier. */
export const useSaveTopic = () => {
  const client = useApolloClient();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
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
  const saveTopic = async (
    topicDoc: ITopicDoc,
    topicId?: string,
    dirtyFields?: Partial<FieldNamesMarkedBoolean<ITopicDoc>>,
  ): Promise<string | null> => {
    let savedId: string | null = topicId ?? null;

    const saved = await run(
      async () => {
        let doc: KnowledgeBaseTopicDoc = withoutEmptyCode(topicDoc);

        if (topicId) {
          if (dirtyFields) {
            const { data } = await client.query({
              query: TOPIC_DETAIL,
              variables: { _id: topicId },
              fetchPolicy: 'network-only',
            });
            const current = data?.knowledgeBaseTopicDetail;
            if (!current) throw new Error(t('not-found', 'Record not found'));
            const changed = <K extends keyof ITopicDoc>(key: K) =>
              dirtyFields[key] ? { [key]: topicDoc[key] } : {};
            doc = {
              title: dirtyFields.title ? topicDoc.title : current.title || '',
              ...changed('description'),
              ...changed('brandId'),
              ...changed('color'),
              ...changed('backgroundImage'),
              ...changed('languageCode'),
              ...changed('notificationSegmentId'),
              ...(dirtyFields.code && topicDoc.code?.trim()
                ? { code: topicDoc.code.trim() }
                : {}),
            };
          }
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

/** Removes topics, clears associated drafts and refreshes topic queries. */
export const useRemoveTopics = () => {
  const client = useApolloClient();
  const closeRemovedRecord = useKbCloseRemovedRecord(
    KB_RECORD_CONTENT_TYPES.topic,
  );
  const [removeTopic, { loading }] = useMutation(REMOVE_TOPIC);

  /** Deletes selected topics and evicts their normalized cache entries. */
  const removeTopics = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeTopic({
          variables: { _id },
          update: (cache) => {
            closeRemovedRecord(_id);
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
