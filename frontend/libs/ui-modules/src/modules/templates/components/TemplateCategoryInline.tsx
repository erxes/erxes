import { Combobox, isUndefinedOrNull, Tooltip } from 'erxes-ui';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  TemplateCategoryInlineContext,
  useTemplateCategoryInlineContext,
} from '../context/TemplateCategoryInlineContext';
import { useTemplateCategory } from '../hooks/useTemplateCategory';
import { TemplateCategory } from '../types';

export const TemplateCategoriesInlineRoot = ({
  categories,
  categoryIds,
  placeholder,
  updateCategories,
  className,
}: {
  categories?: TemplateCategory[];
  categoryIds?: string[];
  placeholder?: string;
  updateCategories?: Dispatch<SetStateAction<TemplateCategory[]>>;
  className?: string;
}) => {
  return (
    <TemplateCategoriesInlineProvider
      categories={categories}
      categoryIds={categoryIds}
      placeholder={placeholder}
      updateCategories={updateCategories}
    >
      <TemplateCategoriesInlineTitle className={className} />
    </TemplateCategoriesInlineProvider>
  );
};

export const TemplateCategoriesInlineProvider = ({
  children,
  categoryIds,
  categories,
  placeholder,
  updateCategories,
}: {
  children?: React.ReactNode;
  categoryIds?: string[];
  categories?: TemplateCategory[];
  placeholder?: string;
  updateCategories?: Dispatch<SetStateAction<TemplateCategory[]>>;
}) => {
  const [_categories, _setCategories] = useState<TemplateCategory[]>(
    categories || [],
  );

  return (
    <TemplateCategoryInlineContext.Provider
      value={{
        categories: categories || _categories,
        loading: false,
        categoryIds: categoryIds,
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select category'
          : placeholder,
        updateCategories: updateCategories || _setCategories,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {categoryIds
        ?.filter((id) => !categories?.some((member) => member._id === id))
        .map((categoryId) => (
          <MemberInlineEffectComponent
            key={categoryId}
            categoryId={categoryId}
          />
        ))}
    </TemplateCategoryInlineContext.Provider>
  );
};

const MemberInlineEffectComponent = ({
  categoryId,
}: {
  categoryId: string;
}) => {
  const { updateCategories } = useTemplateCategoryInlineContext();

  const { category } = useTemplateCategory({
    variables: {
      _id: categoryId,
    },
    skip: !categoryId,
  });

  useEffect(() => {
    if (!updateCategories) return;

    if (category) {
      updateCategories((prev) => {
        if (prev.some((m) => m._id === categoryId)) return prev;

        return [...prev, { ...category, _id: categoryId }];
      });
    }
  }, [category, updateCategories]);

  return null;
};

export const TemplateCategoriesInlineTitle = ({
  className,
}: {
  className?: string;
}) => {
  const { categories, loading, placeholder, categoryIds } =
    useTemplateCategoryInlineContext();

  const activeCategories = categoryIds
    ? categories.filter((m) => categoryIds.includes(m._id))
    : categories;

  const getDisplayValue = () => {
    if (!activeCategories || activeCategories.length === 0) {
      return undefined;
    }

    if (activeCategories.length === 1) {
      return activeCategories?.[0]?.name;
    }

    return `${activeCategories.length} categories`;
  };

  return (
    <Combobox.Value
      value={getDisplayValue()}
      loading={loading}
      placeholder={placeholder}
      className={className}
    />
  );
};

export const TemplateCategoriesInline = Object.assign(
  TemplateCategoriesInlineRoot,
  {
    Provider: TemplateCategoriesInlineProvider,
    Title: TemplateCategoriesInlineTitle,
  },
);
