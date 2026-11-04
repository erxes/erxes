import { useApolloClient, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { KB_RECORD_CONTENT_TYPES } from '@/knowledgebase/constants';
import { useKbCloseRemovedRecord } from '@/knowledgebase/shared/hooks/useKbCloseRemovedRecord';
import {
  ADD_CATEGORY,
  EDIT_CATEGORY,
  REMOVE_CATEGORY,
} from '@/knowledgebase/graphql/mutations';
import {
  ARTICLES,
  CATEGORY_DETAIL,
  CATEGORIES,
  TOPICS,
  TOPIC_DETAIL,
} from '@/knowledgebase/graphql/queries';
import { ICategory, ICategoryDoc } from '@/knowledgebase/types';
import { useKbToast } from '@/knowledgebase/shared/hooks/useKbToast';
import { withoutEmptyCode } from '@/knowledgebase/utils/withoutEmptyCode';
import type { FieldNamesMarkedBoolean } from 'react-hook-form';
import type { KnowledgeBaseCategoryDoc } from '~/gql/graphql';

const CATEGORY_QUERIES = [CATEGORIES, TOPIC_DETAIL, TOPICS];

/** Saves category documents and returns their persistent identifier. */
export const useSaveCategory = () => {
  const client = useApolloClient();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { run } = useKbToast();

  const [addCategory, { loading: adding }] = useMutation(ADD_CATEGORY, {
    refetchQueries: CATEGORY_QUERIES,
    awaitRefetchQueries: true,
  });

  const [editCategory, { loading: editing }] = useMutation(EDIT_CATEGORY, {
    refetchQueries: CATEGORY_QUERIES,
    awaitRefetchQueries: true,
  });

  /** Writes a category without an empty sparse-index code value. */
  const saveCategory = async (
    categoryDoc: ICategoryDoc,
    categoryId?: string,
    dirtyFields?: Partial<FieldNamesMarkedBoolean<ICategoryDoc>>,
  ): Promise<string | null> => {
    let savedId = categoryId ?? null;
    const saved = await run(
      async () => {
        let doc: KnowledgeBaseCategoryDoc = withoutEmptyCode(categoryDoc);

        if (!categoryId) {
          const { data } = await addCategory({ variables: { doc } });
          savedId = data?.knowledgeBaseCategoriesAdd?._id ?? null;
          return;
        }

        if (dirtyFields) {
          const { data } = await client.query({
            query: CATEGORY_DETAIL,
            variables: { _id: categoryId },
            fetchPolicy: 'network-only',
          });
          const current = data?.knowledgeBaseCategoryDetail;
          if (!current) throw new Error(t('not-found', 'Record not found'));
          /** Includes only submitted dirty fields, preserving explicit clears. */
          const changed = <K extends keyof ICategoryDoc>(key: K) =>
            dirtyFields[key] ? { [key]: categoryDoc[key] } : {};
          doc = {
            title: dirtyFields.title ? categoryDoc.title : current.title || '',
            icon: dirtyFields.icon ? categoryDoc.icon : current.icon || 'book',
            ...changed('description'),
            ...changed('topicId'),
            ...changed('parentCategoryId'),
            ...(dirtyFields.code && categoryDoc.code?.trim()
              ? { code: categoryDoc.code.trim() }
              : {}),
          };
        }
        await editCategory({ variables: { _id: categoryId, doc } });
      },
      categoryId
        ? t('kb-category-saved', 'Category saved')
        : t('kb-category-created', 'Category created'),
    );
    return saved ? savedId : null;
  };

  return { saveCategory, loading: adding || editing };
};

/** Provides inline category updates with mutation error feedback. */
export const useEditCategoryField = (topicId: string) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { toast } = useToast();
  const [editCategory, { loading }] = useMutation(EDIT_CATEGORY);

  /** Combines a category row with its edited fields for the topic-scoped write. */
  const editCategoryField = (
    category: ICategory,
    patch: Partial<ICategoryDoc>,
  ) =>
    editCategory({
      variables: {
        _id: category._id,
        doc: withoutEmptyCode({
          title: category.title ?? '',
          code: category.code,
          description: category.description,
          icon: category.icon || 'book',
          topicId,
          parentCategoryId: category.parentCategoryId,
          ...patch,
        }),
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

/** Removes categories, clears associated drafts and refreshes affected lists. */
export const useRemoveCategories = () => {
  const client = useApolloClient();
  const closeRemovedRecord = useKbCloseRemovedRecord(
    KB_RECORD_CONTENT_TYPES.category,
  );
  const [removeCategory, { loading }] = useMutation(REMOVE_CATEGORY);

  /** Deletes selected categories and evicts their normalized cache entries. */
  const removeCategories = async (ids: string[]) => {
    await Promise.all(
      ids.map((_id) =>
        removeCategory({
          variables: { _id },
          update: (cache) => {
            closeRemovedRecord(_id);
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
