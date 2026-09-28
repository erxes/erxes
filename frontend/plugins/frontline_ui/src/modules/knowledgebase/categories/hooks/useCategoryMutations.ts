import { useApolloClient, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ADD_CATEGORY,
  EDIT_CATEGORY,
  REMOVE_CATEGORY,
} from '@/knowledgebase/graphql/mutations';
import {
  ARTICLES,
  CATEGORIES,
  TOPICS,
  TOPIC_DETAIL,
} from '@/knowledgebase/graphql/queries';
import { ICategory, ICategoryDoc } from '@/knowledgebase/types';
import { useKbToast } from '@/knowledgebase/shared/hooks/useKbToast';

const CATEGORY_QUERIES = [CATEGORIES, TOPIC_DETAIL, TOPICS];

export const useSaveCategory = () => {
  const { t } = useTranslation('frontline');
  const { run } = useKbToast();

  const [addCategory, { loading: adding }] = useMutation(ADD_CATEGORY, {
    refetchQueries: CATEGORY_QUERIES,
    awaitRefetchQueries: true,
  });

  const [editCategory, { loading: editing }] = useMutation(EDIT_CATEGORY, {
    refetchQueries: CATEGORY_QUERIES,
    awaitRefetchQueries: true,
  });

  const saveCategory = (doc: ICategoryDoc, categoryId?: string) =>
    run(
      async () => {
        if (categoryId) {
          await editCategory({ variables: { _id: categoryId, doc } });
        } else {
          await addCategory({ variables: { doc } });
        }
      },
      categoryId
        ? t('kb-category-saved', 'Category saved')
        : t('kb-category-created', 'Category created'),
    );

  return { saveCategory, loading: adding || editing };
};

export const useEditCategoryField = (topicId: string) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [editCategory, { loading }] = useMutation(EDIT_CATEGORY);

  const editCategoryField = (
    category: ICategory,
    patch: Partial<ICategoryDoc>,
  ) =>
    editCategory({
      variables: {
        _id: category._id,
        doc: {
          title: category.title,
          code: category.code,
          description: category.description,
          icon: category.icon || 'book',
          topicId,
          parentCategoryId: category.parentCategoryId,
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

  return { editCategoryField, loading };
};

export const useRemoveCategories = () => {
  const client = useApolloClient();
  const [removeCategory, { loading }] = useMutation(REMOVE_CATEGORY);

  const removeCategories = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeCategory({
          variables: { _id },
          update: (cache) => {
            cache.evict({
              id: cache.identify({ __typename: 'KnowledgeBaseCategory', _id }),
            });
            cache.gc();
          },
        }),
      ),
    );

    await client.refetchQueries({
      include: [...CATEGORY_QUERIES, ARTICLES],
    });
  };

  return { removeCategories, loading };
};
