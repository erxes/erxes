import { useApolloClient, useMutation } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useState } from 'react';
import { KB_RECORD_CONTENT_TYPES } from '@/knowledgebase/constants';
import { useKbCloseRemovedRecord } from '@/knowledgebase/shared/hooks/useKbCloseRemovedRecord';
import { useTranslation } from 'react-i18next';
import {
  ADD_ARTICLE,
  EDIT_ARTICLE,
  REMOVE_ARTICLE,
} from '@/knowledgebase/graphql/mutations';
import {
  ARTICLE_DETAIL,
  ARTICLES,
  CATEGORIES,
  TOPICS,
} from '@/knowledgebase/graphql/queries';
import { IArticle, IArticleDetail, IArticleDoc } from '@/knowledgebase/types';
import { toKbAttachment } from '@/knowledgebase/utils/toKbAttachment';
import { useKbToast } from '@/knowledgebase/shared/hooks/useKbToast';
import type { FieldNamesMarkedBoolean } from 'react-hook-form';
import type { KnowledgeBaseArticleDoc } from '~/gql/graphql';

const ARTICLE_QUERIES = [ARTICLES, CATEGORIES, TOPICS];

const hasDirtyFields = (value: unknown): boolean =>
  value === true ||
  (value !== null &&
    typeof value === 'object' &&
    Object.values(value).some(hasDirtyFields));

const articleEditDoc = (
  doc: IArticleDoc,
  current: IArticleDetail,
  dirtyFields: Partial<FieldNamesMarkedBoolean<IArticleDoc>>,
): KnowledgeBaseArticleDoc => {
  const changed = <K extends keyof IArticleDoc>(key: K) =>
    hasDirtyFields(dirtyFields[key]) ? { [key]: doc[key] ?? null } : {};
  const status = dirtyFields.status ? doc.status : current.status || 'draft';
  const scheduleChanged = dirtyFields.scheduledDate || dirtyFields.status;
  let schedule: Pick<KnowledgeBaseArticleDoc, 'scheduledDate'> = {};
  if (status === 'scheduled') {
    schedule = {
      scheduledDate: scheduleChanged
        ? doc.scheduledDate
        : current.scheduledDate,
    };
  } else if (scheduleChanged) {
    schedule = { scheduledDate: null };
  }
  return {
    title: dirtyFields.title ? doc.title : current.title || '',
    content: dirtyFields.content ? doc.content : current.content || '<p></p>',
    status,
    ...changed('summary'),
    ...changed('isPrivate'),
    ...changed('reactionChoices'),
    ...changed('topicId'),
    ...changed('categoryId'),
    ...changed('image'),
    ...changed('attachments'),
    ...changed('pdfAttachment'),
    ...schedule,
  };
};

export const useSaveArticle = () => {
  const client = useApolloClient();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { run } = useKbToast();

  const [addArticle, { loading: adding }] = useMutation(ADD_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const [editArticle, { loading: editing }] = useMutation(EDIT_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const saveArticle = async (
    doc: IArticleDoc,
    articleId?: string,
    dirtyFields?: Partial<FieldNamesMarkedBoolean<IArticleDoc>>,
  ): Promise<string | null> => {
    let savedId = articleId ?? null;
    const saved = await run(
      async () => {
        if (articleId) {
          let editDoc: KnowledgeBaseArticleDoc = doc;
          if (dirtyFields) {
            const { data } = await client.query({
              query: ARTICLE_DETAIL,
              variables: { _id: articleId },
              fetchPolicy: 'network-only',
            });
            const current = data?.knowledgeBaseArticleDetail;
            if (!current) throw new Error(t('kb-article-not-found'));
            editDoc = articleEditDoc(doc, current, dirtyFields);
          }
          await editArticle({ variables: { _id: articleId, doc: editDoc } });
        } else {
          const { data } = await addArticle({ variables: { doc } });
          savedId = data?.knowledgeBaseArticlesAdd?._id ?? null;
        }
      },
      articleId
        ? t('kb-article-saved', 'Article saved')
        : t('kb-article-created', 'Article created'),
    );
    return saved ? savedId : null;
  };

  return { saveArticle, loading: adding || editing };
};

const useFetchArticleDetail = () => {
  const client = useApolloClient();

  return async (articleId: string) => {
    const { data } = await client.query({
      query: ARTICLE_DETAIL,
      variables: { _id: articleId },
      fetchPolicy: 'network-only',
    });

    return data?.knowledgeBaseArticleDetail;
  };
};

const useUpdateArticle = () => {
  const fetchDetail = useFetchArticleDetail();
  const [editArticle, { loading }] = useMutation(EDIT_ARTICLE);

  const updateArticle = async (
    article: IArticle,
    patch: Partial<IArticleDoc>,
  ) => {
    const detail = await fetchDetail(article._id);

    await editArticle({
      variables: {
        _id: article._id,
        doc: {
          title: detail?.title ?? article.title ?? '',
          summary: detail?.summary ?? article.summary,
          content: detail?.content || '<p></p>',
          status: detail?.status ?? article.status ?? 'draft',
          isPrivate: detail?.isPrivate ?? false,
          reactionChoices: detail?.reactionChoices ?? [],
          categoryId: detail?.categoryId ?? article.categoryId,
          scheduledDate: detail?.scheduledDate,
          ...patch,
        },
      },
    });
  };

  return { updateArticle, loading };
};

const movesBetweenLists = (patch: Partial<IArticleDoc>) =>
  'status' in patch || 'categoryId' in patch;

export const useEditArticleField = () => {
  const client = useApolloClient();
  const { failure } = useKbToast();
  const { updateArticle, loading } = useUpdateArticle();

  const editArticleField = async (
    article: IArticle,
    patch: Partial<IArticleDoc>,
  ) => {
    try {
      await updateArticle(article, patch);

      if (movesBetweenLists(patch)) {
        await client.refetchQueries({ include: ARTICLE_QUERIES });
      }
    } catch (error: unknown) {
      failure(error);
    }
  };

  return { editArticleField, loading };
};

export const useBulkEditArticles = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const client = useApolloClient();
  const { run } = useKbToast();
  const { updateArticle } = useUpdateArticle();
  const [loading, setLoading] = useState(false);

  const bulkEditArticles = async (
    articles: IArticle[],
    patch: Partial<IArticleDoc>,
  ) => {
    setLoading(true);

    const done = await run(
      async () => {
        await Promise.all(
          articles.map((article) => updateArticle(article, patch)),
        );
        await client.refetchQueries({ include: ARTICLE_QUERIES });
      },
      t('kb-articles-updated', {
        count: articles.length,
        defaultValue: '{{count}} articles updated',
      }),
    );

    setLoading(false);

    return done;
  };

  return { bulkEditArticles, loading };
};

export const useDuplicateArticle = (topicId: string) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { run } = useKbToast();
  const fetchDetail = useFetchArticleDetail();
  const [addArticle, { loading }] = useMutation(ADD_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const duplicateArticle = (article: Pick<IArticle, '_id'>) =>
    run(async () => {
      const detail = await fetchDetail(article._id);

      if (!detail) {
        throw new Error(t('kb-article-not-found'));
      }

      const pdf = detail.pdfAttachment?.pdf
        ? toKbAttachment(detail.pdfAttachment.pdf)
        : undefined;

      await addArticle({
        variables: {
          doc: {
            title: t('kb-article-copy-title', { title: detail.title }),
            summary: detail.summary,
            content: detail.content || '<p></p>',
            status: 'draft',
            isPrivate: detail.isPrivate ?? false,
            reactionChoices: detail.reactionChoices ?? [],
            topicId,
            categoryId: detail.categoryId,
            image: detail.image ? toKbAttachment(detail.image) : undefined,
            attachments: (detail.attachments ?? [])
              .filter(isDefined)
              .map(toKbAttachment),
            pdfAttachment: pdf ? { pdf } : undefined,
          },
        },
      });
    }, t('kb-article-duplicated'));

  return { duplicateArticle, loading };
};

export const useRemoveArticles = () => {
  const client = useApolloClient();
  const closeRemovedRecord = useKbCloseRemovedRecord(
    KB_RECORD_CONTENT_TYPES.article,
  );
  const [removeArticle, { loading }] = useMutation(REMOVE_ARTICLE);

  const removeArticles = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeArticle({
          variables: { _id },
          update: (cache) => {
            closeRemovedRecord(_id);
            cache.evict({
              id: cache.identify({ __typename: 'KnowledgeBaseArticle', _id }),
            });
            cache.gc();
          },
        }),
      ),
    );

    await client.refetchQueries({ include: ARTICLE_QUERIES });
  };

  return { removeArticles, loading };
};
