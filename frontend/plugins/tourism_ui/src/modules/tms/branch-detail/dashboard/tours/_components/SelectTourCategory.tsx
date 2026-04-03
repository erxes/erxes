import { IconCheck } from '@tabler/icons-react';
import { Button, Popover, Command } from 'erxes-ui';
import { useState } from 'react';
import { useCategories } from '../../category/hooks/useCategories';

interface ITourCategory {
  _id: string;
  name: string;
  parentId?: string;
  order?: number;
  attachment?: {
    url?: string;
    name?: string;
    type?: string;
    size?: number;
    duration?: number;
  };
}

interface SelectTourCategoryProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  branchId?: string;
}

export const SelectTourCategory = ({
  value = [],
  onValueChange,
  placeholder = 'Select categories',
  branchId,
}: SelectTourCategoryProps) => {
  const [open, setOpen] = useState(false);

  const { categories, loading } = useCategories({
    variables: { branchId },
  });

  const handleToggle = (categoryId: string) => {
    const newValue = value.includes(categoryId)
      ? value.filter((id) => id !== categoryId)
      : [...value, categoryId];
    onValueChange?.(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full h-8 font-normal"
          type="button"
        >
          <span className="truncate">
            {value.length > 0
              ? `${value.length} categor${
                  value.length === 1 ? 'y' : 'ies'
                } selected`
              : placeholder}
          </span>
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-[400px] p-0" align="start">
        <Command className="rounded-lg border shadow-md">
          <Command.Input placeholder="Search categories..." className="h-8" />
          <Command.Empty className="py-6 text-sm text-center">
            No categories found.
          </Command.Empty>
          <Command.Group className="max-h-[300px] overflow-auto">
            {loading ? (
              <Command.Item disabled className="h-8">
                Loading...
              </Command.Item>
            ) : (
              (categories as ITourCategory[]).map((category) => {
                const isSelected = value.includes(category._id);

                return (
                  <Command.Item
                    key={category._id}
                    value={`${category.name} ${category._id}`}
                    onSelect={() => handleToggle(category._id)}
                    className="px-2 h-8 cursor-pointer"
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
                      <span className="text-sm truncate">{category.name}</span>
                    </div>
                  </Command.Item>
                );
              })
            )}
          </Command.Group>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
