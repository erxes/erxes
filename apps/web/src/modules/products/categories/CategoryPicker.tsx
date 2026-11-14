import { cn, Combobox, EntityPicker, Popover } from 'erxes-ui';
import { type ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductCategories } from './useProductCategories';

/**
 * Picks one category from the tree (indented under its parents), or none.
 * `exclude` hides categories that can't be picked (a category and those under it, when moving it).
 */
export const CategoryPicker = ({
  id,
  value,
  onChange,
  noneLabel,
  exclude,
  disabled,
  variant,
  className,
}: {
  id?: string;
  value: string | null;
  onChange: (categoryId: string | null) => void;
  noneLabel: string;
  exclude?: Set<string>;
  disabled?: boolean;
  /** The trigger's look, e.g. `ghost` for a side panel cell. */
  variant?: ComponentProps<typeof Combobox.Trigger>['variant'];
  className?: string;
}) => {
  const { t } = useTranslation('product');
  const { tree, query } = useProductCategories();
  const [open, setOpen] = useState(false);
  const selected = tree.find((node) => node.category.id === value);

  const pick = (categoryId: string | null) => {
    onChange(categoryId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        id={id}
        disabled={disabled}
        variant={variant}
        className={cn('h-8', className)}
      >
        <Combobox.Value
          value={selected?.path}
          placeholder={noneLabel}
          loading={query.isPending && !!value}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <EntityPicker
          items={tree.filter((node) => !exclude?.has(node.category.id))}
          keepOrder
          itemKey={(node) => ({ id: node.category.id, label: node.path })}
          renderItem={(node) => (
            <span
              className="truncate pl-(--indent)"
              style={{ '--indent': `${node.depth * 0.75}rem` }}
            >
              {node.category.name}
            </span>
          )}
          value={value ? [value] : []}
          onValueChange={([categoryId]) => pick(categoryId ?? null)}
          loading={query.isPending}
          error={query.error}
          searchPlaceholder={t('category.search', 'Search categories')}
          noneLabel={noneLabel}
        />
      </Combobox.Content>
    </Popover>
  );
};
