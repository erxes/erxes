import {
  Combobox,
  Command,
  Form,
  Popover,
  cn,
} from 'erxes-ui';
import { useState } from 'react';
import { useFixedAssetCategories } from '../hooks/useFixedAssetCategories';

export const SelectFixedAssetCategory = ({
  selected,
  onSelect,
  recordId,
  nullable,
  className,
}: {
  selected?: string;
  onSelect: (value?: string) => void;
  recordId?: string;
  nullable?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { fixedAssetCategories } = useFixedAssetCategories();
  const selectedCategory = fixedAssetCategories?.find(
    (category) => category._id === selected,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
          <span className="truncate">
            {selectedCategory
              ? `${selectedCategory.code} - ${selectedCategory.name}`
              : 'Бүлэг сонгох'}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter>
          <Command.Input placeholder="Бүлэг хайх" />
          <Command.List>
            {nullable && (
              <Command.Item
                value="none"
                onSelect={() => {
                  onSelect(undefined);
                  setOpen(false);
                }}
              >
                Сонгохгүй
              </Command.Item>
            )}
            {fixedAssetCategories
              ?.filter((category) => category._id !== recordId)
              .map((category) => (
                <Command.Item
                  key={category._id}
                  value={`${category.code} ${category.name}`}
                  onSelect={() => {
                    onSelect(category._id);
                    setOpen(false);
                  }}
                >
                  {category.code} - {category.name}
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
