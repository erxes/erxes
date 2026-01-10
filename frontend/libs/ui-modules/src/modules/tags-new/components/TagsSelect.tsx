import {
  Button,
  Combobox,
  Command,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  Skeleton,
  cn,
} from 'erxes-ui';
import { useGetTags } from 'ui-modules/modules/tags-new/hooks/useTags';
import { useTagsTypes } from 'ui-modules/modules/tags/hooks/useTagsTypes';
import { getTagTypeDescription } from 'ui-modules/modules/tags-new/utils/getTagTypeDescription';
import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  forwardRef,
} from 'react';
import { TagInline } from './TagInline';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';
import {
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconTagsFilled,
} from '@tabler/icons-react';
import { TagBadge } from 'ui-modules/modules/tags-new/components/TagBadge';
import { useTagAdd } from 'ui-modules/modules/tags-new/hooks/useTagAdd';
import { TAG_DEFAULT_COLORS } from 'ui-modules/modules/tags-new/constants';
import { useGiveTags } from 'ui-modules/modules/tags-new/hooks/useGiveTags';
import { MutationHookOptions } from '@apollo/client';
import {
  GiveTagsMutationResponse,
  GiveTagsMutationVariables,
} from 'ui-modules/modules/tags-new/types/TagMutations';

type SingleTagsSelectProps = {
  mode: 'single';
  value?: string;
  onValueChange?: (value: string | undefined) => void;
};

type MultipleTagsSelectProps = {
  mode: 'multiple';
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

type TagsSelectProps = {
  type: string | null;
  children?: React.ReactNode;
  scope?: string;
  targetIds?: string[];
  options?: (
    newSelectedTagIds: string[],
  ) => MutationHookOptions<GiveTagsMutationResponse, GiveTagsMutationVariables>;
} & (SingleTagsSelectProps | MultipleTagsSelectProps);

type TagsSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedTags: ITag[];
  setSelectedTags: (tags: ITag[]) => void;
  tags?: ITag[];
  rootTags?: ITag[];
  tagsByParentId: Record<string, ITag[]>;
  handleChange: (tag: ITag) => void;
  mode: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[] | undefined) => void;
  tagGroups: ITag[];
  type: string | null;
  loading: boolean;
  targetIds?: string[];
};

const TagsSelectContext = createContext<TagsSelectContextType>(
  {} as TagsSelectContextType,
);

const useTagsSelectContext = () => useContext(TagsSelectContext);

const TagsSelectProvider = ({
  type,
  mode = 'single',
  value,
  onValueChange,
  children,
  scope,
  targetIds,
  options,
}: TagsSelectProps) => {
  const [open, setOpen] = useState(false);
  const { rootTags, tagsByParentId, tags, tagGroups, loading } = useGetTags({
    variables: {
      type,
    },
  });

  const selectedIds = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value],
  );

  const initialTags = useMemo(
    () => tags?.filter((tag) => selectedIds.includes(tag._id)) || [],
    [tags, selectedIds],
  );

  const [selectedTags, setSelectedTags] = useState<ITag[]>(initialTags);
  const { giveTags } = useGiveTags();
  useEffect(() => {
    if (tags) {
      setSelectedTags(initialTags);
    }
  }, [initialTags, tags]);

  const handleChange = (tag: ITag) => {
    if (mode === 'single') {
      setSelectedTags([tag]);
      setOpen(false);
      if (targetIds) {
        giveTags({
          variables: {
            type,
            targetIds,
            tagIds: [tag._id],
          },
          ...options?.([tag._id]),
        });
      }
      (onValueChange as ((value: string) => void) | undefined)?.(tag._id);
    } else {
      const isSelected = selectedTags.some((t) => t._id === tag._id);
      let newTags: ITag[];
      if (isSelected) {
        newTags = selectedTags.filter((t) => t._id !== tag._id);
      } else {
        newTags = [...selectedTags, tag];
      }
      setSelectedTags(newTags);
      if (targetIds) {
        giveTags({
          variables: {
            type,
            targetIds,
            tagIds: newTags.map((t) => t._id),
          },
          ...options?.(newTags.map((t) => t._id)),
        });
      }
      (onValueChange as ((value: string[]) => void) | undefined)?.(
        newTags.map((t) => t._id),
      );
    }
  };

  return (
    <TagsSelectContext.Provider
      value={{
        loading,
        value,
        open,
        setOpen,
        selectedTags,
        setSelectedTags,
        tags,
        rootTags,
        tagsByParentId,
        handleChange,
        mode,
        tagGroups,
        type,
        targetIds,
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        {children}
      </PopoverScoped>
    </TagsSelectContext.Provider>
  );
};

TagsSelectProvider.displayName = 'TagsSelectProvider';

const TagsSelectValue = ({
  showValue,
  placeholder,
}: {
  showValue?: boolean;
  placeholder?: string;
}) => {
  const { selectedTags, mode } = useTagsSelectContext();

  const text = useMemo(() => {
    if (selectedTags.length === 0 || !showValue)
      return placeholder || 'Select Tag';
    if (mode === 'single') return selectedTags[0].name;
    if (selectedTags.length === 1) return selectedTags[0].name;
    return `${selectedTags.length} tags selected`;
  }, [selectedTags, mode, showValue, placeholder]);

  return <span>{text}</span>;
};

TagsSelectValue.displayName = 'TagsSelectValue';

const TagsSelectTrigger = forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof Button>, 'variant'> & {
    showValue?: boolean;
    placeholder?: string;
    variant?: 'DEFAULT' | 'ICON';
  }
>(({ showValue, placeholder, variant = 'DEFAULT', ...props }, ref) => {
  if (variant === 'ICON') {
    return (
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon">
          <IconPlus />
        </Button>
      </Popover.Trigger>
    );
  }
  return (
    <Popover.Trigger asChild>
      <Button
        ref={ref}
        {...props}
        className="w-min text-sm font-medium shadow-xs"
      >
        <TagsSelectValue showValue={false} placeholder={placeholder} />
        <IconChevronDown />
      </Button>
    </Popover.Trigger>
  );
});
TagsSelectTrigger.displayName = 'TagsSelectTrigger';

const TagsSelectContent = () => {
  const [search, setSearch] = useState('');
  const {
    rootTags,
    tagsByParentId,
    tagGroups,
    selectedTags,
    handleChange,
    loading,
    type,
  } = useTagsSelectContext();
  const { addTag } = useTagAdd();
  const { types } = useTagsTypes();
  const DEFAULT_COLOR = useMemo(() => {
    return Object.values(TAG_DEFAULT_COLORS)[
      Math.floor(Math.random() * Object.values(TAG_DEFAULT_COLORS).length)
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  return (
    <Combobox.Content className="p-0 w-[200px]" align="start">
      <Command>
        <Command.Input
          placeholder="Search tag..."
          value={search}
          onValueChange={setSearch}
          focusOnMount
        />
        <div className="flex flex-wrap gap-x-2 gap-y-1 w-full p-1">
          <TagsSelectedList />
        </div>
        {!selectedTags || selectedTags.length === 0 ? null : (
          <Command.Separator />
        )}
        <Command.List>
          {loading ? (
            <Command.Empty>
              <div className="flex flex-col gap-2 items-start p-4">
                <Skeleton className="w-2/3 h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-2/3 h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            </Command.Empty>
          ) : rootTags?.length === 0 ? (
            <Command.Empty>
              <div>No results found.</div>
            </Command.Empty>
          ) : (
            <Command.Empty className="p-0">
              <div className="flex flex-col gap-px">
                <Button
                  variant="ghost"
                  className="w-full justify-start relative flex gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 h-8 cursor-pointer"
                  onClick={() => {
                    addTag({
                      variables: {
                        name: search,
                        type: null,
                        colorCode: DEFAULT_COLOR,
                      },
                      onCompleted: (data) => {
                        handleChange(data.tagsAdd);
                      },
                    });
                  }}
                >
                  <IconPlus />
                  Add workspace tag: "{search}"
                </Button>
                {type && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start relative flex gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 h-8 cursor-pointer"
                    onClick={() => {
                      addTag({
                        variables: {
                          name: search,
                          colorCode: DEFAULT_COLOR,
                          type,
                        },
                        onCompleted: (data) => {
                          handleChange(data.tagsAdd);
                        },
                      });
                    }}
                  >
                    <IconPlus />
                    Add{' '}
                    {getTagTypeDescription({
                      tagTypes: types,
                      type,
                    })}{' '}
                    tag: "{search}"
                  </Button>
                )}
              </div>
            </Command.Empty>
          )}
          {rootTags?.map(
            (tag) =>
              !tag.isGroup && (
                <Command.Item
                  key={tag._id}
                  value={tag.name}
                  onSelect={() => handleChange(tag)}
                  className="justify-between"
                >
                  <TagInline tag={tag} />
                  <IconCheck
                    className={cn(
                      'h-4 w-4 text-primary',
                      selectedTags.some((t) => t._id === tag._id)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </Command.Item>
              ),
          )}
          {tagGroups.map((tag) => (
            <Command.Group key={tag._id} heading={tag.name}>
              {tagsByParentId[tag._id]?.map((childTag) => (
                <Command.Item
                  key={childTag._id}
                  value={childTag.name}
                  onSelect={() => handleChange(childTag)}
                  className="flex justify-between"
                >
                  <TagInline tag={childTag} />
                  <IconCheck
                    className={cn(
                      'h-4 w-4 text-primary',
                      selectedTags.some((t) => t._id === childTag._id)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </Combobox.Content>
  );
};

TagsSelectContent.displayName = 'TagsSelectContent';

const TagsSelectedList = ({
  placeholder,
  renderAsPlainText,
  ...props
}: Omit<React.ComponentProps<typeof TagBadge>, 'onClose'> & {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const {
    selectedTags,
    setSelectedTags,
    onValueChange,
    mode,
    targetIds,
    type,
  } = useTagsSelectContext();
  const { giveTags } = useGiveTags();
  if (!selectedTags || selectedTags.length === 0) return null;

  return (
    <>
      {selectedTags.map((tag) => (
        <TagBadge
          key={tag._id}
          tagId={tag._id}
          tag={tag}
          renderAsPlainText={renderAsPlainText}
          variant="secondary"
          onCompleted={(tag) => {
            if (!tag) return;
            if (selectedTags.some((t) => t._id === tag._id)) {
              setSelectedTags(selectedTags.filter((t) => t._id !== tag._id));
            }
            if (!selectedTags.includes(tag)) {
              setSelectedTags([...selectedTags, tag]);
            }
          }}
          onClose={() => {
            if (mode === 'single') {
              setSelectedTags([]);
              (onValueChange as (value: string | undefined) => void)?.(
                undefined,
              );
              if (targetIds) {
                giveTags({
                  variables: {
                    type,
                    targetIds,
                    tagIds: [],
                  },
                });
              }
            } else {
              const newTags = selectedTags.filter((t) => t._id !== tag._id);
              setSelectedTags(newTags);
              (onValueChange as (value: string[]) => void)?.(
                newTags.map((t) => t._id),
              );
              if (targetIds) {
                giveTags({
                  variables: {
                    type,
                    targetIds,
                    tagIds: newTags.map((t) => t._id),
                  },
                });
              }
            }
          }}
          {...props}
        />
      ))}
    </>
  );
};
TagsSelectedList.displayName = 'TagsSelectedList';

const TagsSelectRoot = forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentProps<typeof TagsSelectProvider> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children' | 'type'
    > & {
      scope?: string;
      targetIds?: string[];
    }
>(({ scope, targetIds, ...props }, ref) => {
  return (
    <TagsSelectProvider {...props} scope={scope} targetIds={targetIds}>
      <TagsSelectTrigger ref={ref} />
      <TagsSelectContent />
    </TagsSelectProvider>
  );
});

TagsSelectRoot.displayName = 'TagsSelectRoot';

const TagsSelectInlineCell = forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentProps<typeof TagsSelectProvider> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children' | 'type'
    > & {
      scope?: string;
      targetIds?: string[];
    }
>(({ scope, targetIds, ...props }, ref) => {
  return (
    <TagsSelectProvider {...props} scope={scope} targetIds={targetIds}>
      <RecordTableInlineCell.Trigger ref={ref}>
        <div className="flex gap-x-2 gap-y-1 items-center">
          <TagsSelectedList />
        </div>
      </RecordTableInlineCell.Trigger>
      <TagsSelectContent />
    </TagsSelectProvider>
  );
});

export const TagsSelect = Object.assign(TagsSelectRoot, {
  Provider: TagsSelectProvider,
  Content: TagsSelectContent,
  Value: TagsSelectValue,
  Trigger: TagsSelectTrigger,
  SelectedList: TagsSelectedList,
  InlineCell: TagsSelectInlineCell,
});
