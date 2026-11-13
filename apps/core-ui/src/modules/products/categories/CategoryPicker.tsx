import { cn, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { useProductCategories } from './useProductCategories';

const NONE = '__none__';

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
  className,
}: {
  id?: string;
  value: string | null;
  onChange: (categoryId: string | null) => void;
  noneLabel: string;
  exclude?: Set<string>;
  disabled?: boolean;
  /** The trigger's look, e.g. a side panel cell. */
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
      <Combobox.Trigger id={id} disabled={disabled} className={cn('h-8', className)}>
        <Combobox.Value
          value={selected?.path}
          placeholder={noneLabel}
          loading={query.isPending && !!value}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('category.search', 'Search categories')} />
          <Command.List className="max-h-72 p-1">
            {query.isError && (
              <p role="alert" className="p-2 text-sm text-destructive">
                {messageOf(query.error)}
              </p>
            )}
            <Command.Empty>{t('category.none-found', 'No categories found')}</Command.Empty>
            <Command.Item value={NONE} onSelect={() => pick(null)}>
              <span className="text-muted-foreground">{noneLabel}</span>
              <Combobox.Check checked={value === null} />
            </Command.Item>
            {tree
              .filter((node) => !exclude?.has(node.category.id))
              .map((node) => (
                <Command.Item
                  key={node.category.id}
                  value={node.path}
                  onSelect={() => pick(node.category.id)}
                >
                  <span className="truncate" style={{ paddingLeft: `${node.depth * 0.75}rem` }}>
                    {node.category.name}
                  </span>
                  <Combobox.Check checked={value === node.category.id} />
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
