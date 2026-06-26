import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  Form,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

import { IconTag } from '@tabler/icons-react';
import { POST_CMS_TAGS } from '../../graphql/queries/postCmsTagsQuery';
import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { cmsLanguageAtom } from '~/modules/cms/shared/states/cmsLanguageState';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';
import { useTranslation } from 'react-i18next';

interface ITag {
  _id: string;
  name: string;
  slug?: string;
  colorCode?: string;
  clientPortalId?: string;
}

interface SelectTagsContextType {
  value: string;
  onValueChange: (tag: string) => void;
  tags?: ITag[];
  loading?: boolean;
}

const TAGS_PER_PAGE = 100;

const SelectTagsContext = createContext<SelectTagsContextType | null>(null);

const useSelectTagsContext = () => {
  const context = useContext(SelectTagsContext);
  if (!context) {
    throw new Error(
      'useSelectTagsContext must be used within SelectTagsProvider',
    );
  }
  return context;
};

export const SelectTagsProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  clientPortalId,
}: {
  value: string | string[];
  onValueChange: (tag: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  clientPortalId?: string;
}) => {
  const language = useAtomValue(cmsLanguageAtom);
  const fetchedCursorsRef = useRef<Set<string>>(new Set());
  const fetchingMoreRef = useRef(false);

  const variables = useMemo(
    () => ({
      clientPortalId,
      limit: TAGS_PER_PAGE,
      language,
    }),
    [clientPortalId, language],
  );

  const { data, loading, fetchMore } = useQuery(POST_CMS_TAGS, {
    variables,
    skip: clientPortalId == null,
  });

  const pageInfo = data?.cmsTags?.pageInfo;

  useEffect(() => {
    fetchedCursorsRef.current.clear();
  }, [variables]);

  const fetchRemainingTags = useCallback(async () => {
    const endCursor = pageInfo?.endCursor;

    if (
      !pageInfo?.hasNextPage ||
      !endCursor ||
      fetchingMoreRef.current ||
      fetchedCursorsRef.current.has(endCursor)
    ) {
      return;
    }

    fetchingMoreRef.current = true;
    fetchedCursorsRef.current.add(endCursor);

    try {
      await fetchMore({
        variables: {
          ...variables,
          cursor: endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.cmsTags) {
            return prev;
          }

          return {
            ...prev,
            cmsTags: {
              ...fetchMoreResult.cmsTags,
              tags: [
                ...(prev.cmsTags?.tags || []),
                ...(fetchMoreResult.cmsTags.tags || []),
              ],
            },
          };
        },
      });
    } finally {
      fetchingMoreRef.current = false;
    }
  }, [fetchMore, pageInfo?.endCursor, pageInfo?.hasNextPage, variables]);

  useEffect(() => {
    fetchRemainingTags();
  }, [fetchRemainingTags]);

  const tags = useMemo(() => data?.cmsTags?.tags || [], [data?.cmsTags?.tags]);

  const handleValueChange = useCallback(
    (tag: string) => {
      if (!tag) return;
      onValueChange?.(tag);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value:
        mode === 'single'
          ? (value as string) || ''
          : (value as string[]).join(','),
      onValueChange: handleValueChange,
      tags,
      loading,
    }),
    [value, handleValueChange, tags, loading, mode],
  );

  return (
    <SelectTagsContext.Provider value={contextValue}>
      {children}
    </SelectTagsContext.Provider>
  );
};

const SelectTagsValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { t } = useTranslation('content');
  const { value, tags } = useSelectTagsContext();
  const selectedTag = tags?.find((tag) => tag._id === value);

  if (!selectedTag) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || t('select-tag')}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {selectedTag.colorCode && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: selectedTag.colorCode }}
        />
      )}
      <p className={cn('font-medium text-sm', className)}>{selectedTag.name}</p>
    </div>
  );
};

const SelectTagsCommandItem = ({ tag }: { tag: ITag }) => {
  const { onValueChange, value } = useSelectTagsContext();
  const { _id, name, colorCode } = tag || {};
  const isChecked = value.split(',').includes(_id);

  return (
    <Command.Item
      value={_id}
      onSelect={() => {
        onValueChange(_id);
      }}
    >
      <div className="flex items-center gap-2">
        {colorCode && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colorCode }}
          />
        )}
        <span className="font-medium">{name}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectTagsContent = () => {
  const { t } = useTranslation('content');
  const { tags, loading } = useSelectTagsContext();

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder={t('search-tags')} />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">{t('loading-tags')}</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder={t('search-tags')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-tags-found')}</span>
      </Command.Empty>
      <Command.List>
        {tags?.map((tag) => (
          <SelectTagsCommandItem key={tag._id} tag={tag} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectTagsFilterItem = () => {
  const { t } = useTranslation('content');
  return (
    <Filter.Item value="tags">
      <IconTag />
      {t('tags')}
    </Filter.Item>
  );
};

export const SelectTagsFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  clientPortalId,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  clientPortalId?: string;
}) => {
  const [tags, setTags] = useQueryState<string[] | string>(queryKey || 'tags');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'tags'}>
      <SelectTagsProvider
        mode={mode}
        value={tags || (mode === 'single' ? '' : [])}
        clientPortalId={clientPortalId}
        onValueChange={(value) => {
          setTags(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectTagsContent />
      </SelectTagsProvider>
    </Filter.View>
  );
};

export const SelectTagsFilterBar = ({
  onValueChange,
  mode = 'single',
  clientPortalId,
}: {
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  clientPortalId?: string;
}) => {
  const { t } = useTranslation('content');
  const [tags, setTags] = useQueryState<string[] | string>('tags');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'tags'}>
      <Filter.BarName>
        <IconTag />
        {t('tags')}
      </Filter.BarName>
      <SelectTagsProvider
        mode={mode}
        value={tags || (mode === 'single' ? '' : [])}
        clientPortalId={clientPortalId}
        onValueChange={(value) => {
          if (value.length > 0) {
            setTags(value as string[] | string);
          } else {
            setTags(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'tags'}>
              <SelectTagsValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectTagsContent />
          </Combobox.Content>
        </Popover>
      </SelectTagsProvider>
    </Filter.BarItem>
  );
};

export const SelectTagsFormItem = ({
  onValueChange,
  className,
  placeholder,
  clientPortalId,
  ...props
}: Omit<React.ComponentProps<typeof SelectTagsProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  clientPortalId?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectTagsProvider
      clientPortalId={clientPortalId}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectTagsValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectTagsContent />
        </Combobox.Content>
      </Popover>
    </SelectTagsProvider>
  );
};

SelectTagsFormItem.displayName = 'SelectTagsFormItem';

const SelectTagsRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
  clientPortalId,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  clientPortalId?: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectTagsProvider
      value={value}
      clientPortalId={clientPortalId}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectTagsValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectTagsContent />
        </SelectContent>
      </PopoverScoped>
    </SelectTagsProvider>
  );
};

export const SelectTags = Object.assign(SelectTagsRoot, {
  Provider: SelectTagsProvider,
  Value: SelectTagsValue,
  Content: SelectTagsContent,
  FilterItem: SelectTagsFilterItem,
  FilterView: SelectTagsFilterView,
  FilterBar: SelectTagsFilterBar,
  FormItem: SelectTagsFormItem,
});
