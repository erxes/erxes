import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CMS_CATEGORIES_ADD } from '../../../../categories/graphql/mutations/categoriesAddMutation';

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');

export const useInlineCategory = (websiteId: string) => {
  const [addCategoryMutation] = useMutation(CMS_CATEGORIES_ADD);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const toggleInput = () => {
    setShowCategoryInput((v) => !v);
    setNewCategoryName('');
  };

  const createCategory = async (): Promise<string | null> => {
    if (!newCategoryName.trim() || addingCategory) return null;
    setAddingCategory(true);
    try {
      const res = await addCategoryMutation({
        variables: {
          input: {
            name: newCategoryName.trim(),
            slug: toSlug(newCategoryName.trim()),
            clientPortalId: websiteId,
          },
        },
        refetchQueries: ['CombinedCmsData'],
      });
      return res.data?.cmsCategoriesAdd?._id ?? null;
    } finally {
      setAddingCategory(false);
      setShowCategoryInput(false);
      setNewCategoryName('');
    }
  };

  return {
    newCategoryName,
    setNewCategoryName,
    showCategoryInput,
    toggleInput,
    addingCategory,
    createCategory,
  };
};
