import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { Command } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { GET_ELEMENT_CATEGORIES } from '../graphql/categoryQueries';
import { IElementCategory } from '../types/elementCategory';

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export const CategorySelector = ({
  value,
  onChange,
}: CategorySelectorProps) => {
  const { data, loading } = useQuery<{
    bmsElementCategories: IElementCategory[];
  }>(GET_ELEMENT_CATEGORIES);

  const categories = useMemo(
    () => data?.bmsElementCategories || [],
    [data?.bmsElementCategories],
  );

  const categoryTree = useMemo(() => {
    const tree: Record<string, IElementCategory[]> = {};
    const roots: IElementCategory[] = [];

    categories.forEach((cat) => {
      if (!cat.parentId) {
        roots.push(cat);
      } else {
        if (!tree[cat.parentId]) {
          tree[cat.parentId] = [];
        }
        tree[cat.parentId].push(cat);
      }
    });

    return { roots, tree };
  }, [categories]);

  const flattenedCategories = useMemo(() => {
    const result: Array<{ category: IElementCategory; level: number }> = [];

    const visit = (category: IElementCategory, level: number) => {
      result.push({ category, level });

      const children = categoryTree.tree[category._id] || [];
      children.forEach((child) => visit(child, level + 1));
    };

    categoryTree.roots.forEach((root) => visit(root, 0));

    return result;
  }, [categoryTree]);

  if (loading) {
    return (
      <Command.Item disabled className="h-8">
        Loading...
      </Command.Item>
    );
  }

  return (
    <>
      {flattenedCategories.map(({ category, level }) => {
        const isSelected = value === category._id;

        return (
          <Command.Item
            key={category._id}
            value={`${category.name} ${category._id}`}
            onSelect={() => onChange(category._id)}
            className="px-2 h-8 cursor-pointer"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            <div className="flex flex-1 gap-2 items-center">
              <span className="flex-1 text-sm truncate">{category.name}</span>
              {isSelected && <IconCheck size={16} className="ml-2" />}
            </div>
          </Command.Item>
        );
      })}
    </>
  );
};
