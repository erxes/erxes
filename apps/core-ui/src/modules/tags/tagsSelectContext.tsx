import type { ContentType, Tag } from '@erxes/core-contract';
import { IconCircleFilled } from '@tabler/icons-react';
import { Badge, PopoverScoped, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { useTags } from './useTags';

/*
 * TagsSelect on core's tags: a provider holding the
 * selection, the searchable list with "create", the selected badges, and the
 * inline cell / trigger / filter shapes built from them. The caller saves.
 */

interface ITagsSelectContext {
  type: ContentType;
  mode: 'single' | 'multiple';
  selectedIds: string[];
  tags: Tag[];
  loading: boolean;
  toggle: (tag: Tag) => void;
  remove: (tagId: string) => void;
}

const TagsSelectContext = createContext<ITagsSelectContext | null>(null);

export const useTagsSelectContext = () => {
  const context = useContext(TagsSelectContext);

  if (!context) throw new Error('TagsSelect parts must be inside TagsSelect.Provider');

  return context;
};

export interface TagsSelectProviderProps {
  type: ContentType;
  mode?: 'single' | 'multiple';
  value?: string[] | string | null;
  onValueChange?: (tagIds: string[]) => void;
  scope?: string;
  children: ReactNode;
}

const toTagIds = (value: TagsSelectProviderProps['value']) =>
  Array.isArray(value) ? value : value ? [value] : [];

export const TagsSelectProvider = ({
  type,
  mode = 'multiple',
  value,
  onValueChange,
  scope,
  children,
}: TagsSelectProviderProps) => {
  const { tags, loading } = useTags(type);
  const [open, setOpen] = useState(false);
  const valueKey = JSON.stringify(value ?? null);
  const [syncedKey, setSyncedKey] = useState(valueKey);
  // Consecutive toggles use the local selection until the saved value arrives.
  const [selectedIds, setSelectedIds] = useState(() => toTagIds(value));

  if (syncedKey !== valueKey) {
    setSyncedKey(valueKey);
    setSelectedIds(toTagIds(value));
  }

  const change = (ids: string[]) => {
    setSelectedIds(ids);
    onValueChange?.(ids);
  };

  const toggle = (tag: Tag) => {
    if (mode === 'single') {
      setOpen(false);
      change([tag.id]);

      return;
    }

    change(
      selectedIds.includes(tag.id)
        ? selectedIds.filter((id) => id !== tag.id)
        : [...selectedIds, tag.id],
    );
  };

  return (
    <TagsSelectContext.Provider
      value={{
        type,
        mode,
        selectedIds,
        tags,
        loading,
        toggle,
        remove: (tagId) => change(selectedIds.filter((id) => id !== tagId)),
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        {children}
      </PopoverScoped>
    </TagsSelectContext.Provider>
  );
};

/** A tag's colour dot and name. */
export const TagInline = ({ tag }: { tag: Pick<Tag, 'name' | 'colorCode'> }) => (
  <div className="flex max-w-full items-center gap-3">
    <span>
      <IconCircleFilled className="size-3!" style={{ color: tag.colorCode ?? undefined }} />
    </span>
    <TextOverflowTooltip value={tag.name} />
  </div>
);

const UNKNOWN_TAG_LABEL = 'Unknown tag';

/** The selected tags as badges; `maxVisible` folds the rest into "+N". */
export const TagsSelectedList = ({
  maxVisible,
  placeholder,
  className,
}: {
  maxVisible?: number;
  placeholder?: string;
  className?: string;
}) => {
  const { selectedIds, tags, loading, remove } = useTagsSelectContext();

  if (loading && selectedIds.length > 0) {
    return <Skeleton className="h-5 w-20" />;
  }

  if (selectedIds.length === 0) {
    return placeholder ? <span className="text-muted-foreground">{placeholder}</span> : null;
  }

  const visible = maxVisible === undefined ? selectedIds : selectedIds.slice(0, maxVisible);
  const remaining = selectedIds.length - visible.length;

  return (
    <>
      {visible.map((id) => {
        const tag = tags.find((item) => item.id === id);
        const onClose = maxVisible === undefined ? () => remove(id) : undefined;

        return tag ? (
          <Badge key={id} variant="secondary" className={className} onClose={onClose}>
            <TagInline tag={tag} />
          </Badge>
        ) : (
          <Badge
            key={id}
            variant="secondary"
            className={className}
            onClose={onClose}
            title={UNKNOWN_TAG_LABEL}
          >
            <span className="max-w-24 truncate">{UNKNOWN_TAG_LABEL}</span>
          </Badge>
        );
      })}
      {remaining > 0 && (
        <Badge variant="secondary" className="shrink-0 text-muted-foreground">
          +{remaining}
        </Badge>
      )}
    </>
  );
};
