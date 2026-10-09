import { useApolloClient, useMutation } from '@apollo/client';
import { useState } from 'react';
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
} from '@/knowledgebase/graphql/queries';
import {
  IArticle,
  IArticleDetailResponse,
  IArticleDoc,
  IKbAttachment,
} from '@/knowledgebase/types';
import { useKbToast } from '@/knowledgebase/shared/hooks/useKbToast';

const ARTICLE_QUERIES = [ARTICLES, CATEGORIES];

export const useSaveArticle = () => {
  const { t } = useTranslation('frontline');
  const { run } = useKbToast();

  const [addArticle, { loading: adding }] = useMutation(ADD_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const [editArticle, { loading: editing }] = useMutation(EDIT_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const saveArticle = (doc: IArticleDoc, articleId?: string) =>
    run(
      async () => {
        if (articleId) {
          await editArticle({ variables: { _id: articleId, doc } });
        } else {
          await addArticle({ variables: { doc } });
        }
      },
      articleId
        ? t('kb-article-saved', 'Article saved')
        : t('kb-article-created', 'Article created'),
    );

  return { saveArticle, loading: adding || editing };
};

const toAttachmentInput = (
  attachment?: IKbAttachment | null,
): IKbAttachment | undefined =>
  attachment
    ? {
        url: attachment.url,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        duration: attachment.duration,
      }
    : undefined;

const useFetchArticleDetail = () => {
  const client = useApolloClient();

  return async (articleId: string) => {
    const { data } = await client.query<IArticleDetailResponse>({
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
          title: detail?.title ?? article.title,
          summary: detail?.summary ?? article.summary,
          content: detail?.content || '<p></p>',
          status: detail?.status ?? article.status,
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
  const { t } = useTranslation('frontline');
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
  const { t } = useTranslation('frontline');
  const { run } = useKbToast();
  const fetchDetail = useFetchArticleDetail();
  const [addArticle, { loading }] = useMutation(ADD_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const duplicateArticle = (article: IArticle) =>
    run(
      async () => {
        const detail = await fetchDetail(article._id);

        if (!detail) {
          throw new Error(t('kb-article-not-found', 'Article not found'));
        }

        const pdf = toAttachmentInput(detail.pdfAttachment?.pdf);

        await addArticle({
          variables: {
            doc: {
              title: t('kb-article-copy-title', {
                title: detail.title,
                defaultValue: '{{title}} (copy)',
              }),
              summary: detail.summary,
              content: detail.content || '<p></p>',
              status: 'draft',
              isPrivate: detail.isPrivate ?? false,
              reactionChoices: detail.reactionChoices ?? [],
              topicId,
              categoryId: detail.categoryId,
              image: toAttachmentInput(detail.image),
              attachments: (detail.attachments ?? []).map(toAttachmentInput),
              pdfAttachment: pdf ? { pdf } : undefined,
            },
          },
        });
      },
      t('kb-article-duplicated', 'Article duplicated as a draft'),
    );

  return { duplicateArticle, loading };
};

export const useRemoveArticles = () => {
  const client = useApolloClient();
  const [removeArticle, { loading }] = useMutation(REMOVE_ARTICLE);

  const removeArticles = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeArticle({
          variables: { _id },
          update: (cache) => {
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
