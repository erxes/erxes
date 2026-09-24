import { useApolloClient, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
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
} from '@/knowledgebase/types';

const ARTICLE_QUERIES = [ARTICLES, CATEGORIES];

export const useSaveArticle = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();

  const [addArticle, { loading: adding }] = useMutation(ADD_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const [editArticle, { loading: editing }] = useMutation(EDIT_ARTICLE, {
    refetchQueries: ARTICLE_QUERIES,
    awaitRefetchQueries: true,
  });

  const saveArticle = async (doc: IArticleDoc, articleId?: string) => {
    try {
      if (articleId) {
        await editArticle({ variables: { _id: articleId, doc } });
      } else {
        await addArticle({ variables: { doc } });
      }

      toast({
        title: t('success'),
        description: articleId
          ? t('kb-article-saved', 'Article saved')
          : t('kb-article-created', 'Article created'),
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

  return { saveArticle, loading: adding || editing };
};

export const useEditArticleField = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const client = useApolloClient();
  const [editArticle, { loading }] = useMutation(EDIT_ARTICLE);

  const editArticleField = async (
    article: IArticle,
    patch: Partial<IArticleDoc>,
  ) => {
    try {
      const { data } = await client.query<IArticleDetailResponse>({
        query: ARTICLE_DETAIL,
        variables: { _id: article._id },
        fetchPolicy: 'network-only',
      });

      const detail = data?.knowledgeBaseArticleDetail;

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
            ...patch,
          },
        },
      });
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('something-went-wrong'),
        variant: 'destructive',
      });
    }
  };

  return { editArticleField, loading };
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
