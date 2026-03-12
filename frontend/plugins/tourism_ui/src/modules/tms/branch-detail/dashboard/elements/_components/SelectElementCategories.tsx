import { useQuery } from '@apollo/client';
import { useState, useMemo } from 'react';
import { Control } from 'react-hook-form';
import { Form, Button, Popover, Command } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { GET_ELEMENT_CATEGORIES } from '../graphql/categoryQueries';
import { IElementCategory } from '../types/elementCategory';
import { ElementCreateFormType } from '../constants/formSchema';

interface SelectElementCategoriesProps {
  control: Control<ElementCreateFormType>;
}

export const SelectElementCategories = ({
  control,
}: SelectElementCategoriesProps) => {
  const [open, setOpen] = useState(false);

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

  return (
    <Form.Field
      control={control}
      name="categories"
      render={({ field }) => {
        const selectedIds = field.value || [];

        const handleToggle = (categoryId: string) => {
          const newValue = selectedIds.includes(categoryId)
            ? selectedIds.filter((id) => id !== categoryId)
            : [...selectedIds, categoryId];
          field.onChange(newValue);
        };

        return (
          <Form.Item>
            <Form.Label>Categories</Form.Label>
            <Form.Control>
              <div className="space-y-3">
                <Popover open={open} onOpenChange={setOpen}>
                  <Popover.Trigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="justify-between w-full h-9 font-normal"
                      type="button"
                    >
                      <span className="truncate">
                        {selectedIds.length > 0
                          ? `${selectedIds.length} categor${
                              selectedIds.length === 1 ? 'y' : 'ies'
                            } selected`
                          : 'Select categories'}
                      </span>
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content className="w-[400px] p-0" align="start">
                    <Command className="rounded-lg border shadow-md">
                      <Command.Input
                        placeholder="Search categories..."
                        className="h-9"
                      />
                      <Command.Empty className="py-6 text-sm text-center">
                        No categories found.
                      </Command.Empty>
                      <Command.Group className="max-h-[300px] overflow-auto">
                        {loading ? (
                          <Command.Item disabled className="h-8">
                            Loading...
                          </Command.Item>
                        ) : (
                          flattenedCategories.map(({ category, level }) => {
                            const isSelected = selectedIds.includes(
                              category._id,
                            );

                            return (
                              <Command.Item
                                key={category._id}
                                value={`${category.name} ${category._id}`}
                                onSelect={() => handleToggle(category._id)}
                                className="px-2 h-8 cursor-pointer"
                                style={{ paddingLeft: `${level * 12 + 8}px` }}
                              >
                                <div className="flex flex-1 gap-2 items-center">
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'bg-primary border-primary'
                                        : 'border-input bg-background'
                                    }`}
                                  >
                                    {isSelected && (
                                      <IconCheck
                                        size={12}
                                        className="text-primary-foreground"
                                      />
                                    )}
                                  </div>
                                  <span className="text-sm truncate">
                                    {category.name}
                                  </span>
                                </div>
                              </Command.Item>
                            );
                          })
                        )}
                      </Command.Group>
                    </Command>
                  </Popover.Content>
                </Popover>
              </div>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        );
      }}
    />
  );
};
