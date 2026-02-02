import { IconPlus, IconUser } from '@tabler/icons-react';
import {
  AvatarProps,
  Button,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useUsers } from 'ui-modules/modules';
import { currentUserState } from 'ui-modules/states';
import { useDebounce } from 'use-debounce';

import { IAttribution } from '../../../types/attributionType';
import {
  useSelectAttributionContext,
  SelectAttributionContext,
} from '../../../context/SelectAttributionContext';

const SelectAttributionProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  attribution,
  setOpen,
  allowUnassigned,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange?: (value: string[] | string | null) => void;
  attribution?: IAttribution[];
  setOpen?: (open: boolean) => void;
  allowUnassigned?: boolean;
}) => {
  const [currentAttribution, setCurrentAttribution] = useState<IAttribution[]>(
    attribution || [],
  );
  const isSingleMode = mode === 'single';

  const onSelect = (attribution: IAttribution | null) => {
    if (!attribution) {
      setCurrentAttribution([]);
      onValueChange?.(mode === 'single' ? null : []);
      setOpen?.(false);
      return;
    }
    if (isSingleMode) {
      setCurrentAttribution([attribution]);
      setOpen?.(false);
      return onValueChange?.(attribution._id);
    }
    const arrayValue = Array.isArray(value) ? value : [];

    const isAttributionSelected = arrayValue.includes(attribution._id);
    const newSelectedAttributionIds = isAttributionSelected
      ? arrayValue.filter((id) => id !== attribution._id)
      : [...arrayValue, attribution._id];

    setCurrentAttribution((prev) => {
      const uniqueAttribution = [...prev, attribution].filter(
        (m, index, self) => index === self.findIndex((t) => t._id === m._id),
      );
      return uniqueAttribution.filter((m) =>
        newSelectedAttributionIds.includes(m._id),
      );
    });
    onValueChange?.(newSelectedAttributionIds);
  };

  const attributionIds = Array.isArray(value) ? value : value && [value] || [];
  const loading = attributionIds.some(
    (id) => !currentAttribution.find((m) => m._id === id),
  );

  return (
    <SelectAttributionContext.Provider
      value={{
        attributionIds,
        onSelect,
        members: currentAttribution,
        setMembers: setCurrentAttribution,
        loading,
        allowUnassigned: allowUnassigned || false,
      }}
    >
      {children}
    </SelectAttributionContext.Provider>
  );
};

const SelectAttributionValue = ({
  placeholder,
  size,
}: {
  placeholder?: string;
  size?: AvatarProps['size'];
}) => {
  const { attributionIds, members } = useSelectAttributionContext();

  if (attributionIds.length === 0) {
    return (
      <div className="text-muted-foreground">
        {placeholder || 'Select attribution...'}
      </div>
    );
  }

  const selectedAttributions = members.filter((attribution) =>
    attributionIds.includes(attribution._id),
  );

  return (
    <div className="flex flex-wrap gap-1">
      {selectedAttributions.map((attribution) => (
        <div key={attribution._id} className="text-sm">
          {attribution.details?.fullName ||
            attribution.username ||
            attribution.email ||
            'Unknown'}
        </div>
      ))}
    </div>
  );
};

const SelectAttributionCommandItem = ({
  attribution,
}: {
  attribution: IAttribution;
}) => {
  const { onSelect, attributionIds } = useSelectAttributionContext();

  return (
    <Command.Item
      value={attribution._id}
      onSelect={() => {
        onSelect(attribution);
      }}
    >
      <Combobox.Check checked={attributionIds.includes(attribution._id)} />
      <div className="ml-2">
        <div className="font-medium">
          {attribution.details?.fullName || attribution.username || 'Unknown'}
        </div>
        {attribution.email && (
          <div className="text-sm text-muted-foreground">
            {attribution.email}
          </div>
        )}
      </div>
    </Command.Item>
  );
};

const SelectAttributionNoAssigneeItem = () => {
  const { onSelect, attributionIds } = useSelectAttributionContext();
  const isNoAssigneeSelected =
    attributionIds?.length === 1 && attributionIds[0] === 'no-assignee';
  return (
    <Command.Item value="no-assignee" onSelect={() => onSelect(null)}>
      <Combobox.Check checked={isNoAssigneeSelected} />
    </Command.Item>
  );
};

const SelectAttributionContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IAttribution;
  const { attributionIds, members, allowUnassigned } =
    useSelectAttributionContext();
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
      excludeIds: true,
      ids: [currentUser?._id],
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {members.length > 0 && (
          <>
            {members.map((attribution) => (
              <SelectAttributionCommandItem
                key={attribution._id}
                attribution={attribution}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {!loading && allowUnassigned && <SelectAttributionNoAssigneeItem />}

        {!loading &&
          [currentUser, ...users]
            .filter(
              (user) =>
                !attributionIds.find(
                  (attributionId) => attributionId === user._id,
                ),
            )
            .map((user) => (
              <SelectAttributionCommandItem key={user._id} attribution={user} />
            ))}

        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={users.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};

export const SelectAttributionFilterItem = ({
  value,
  label,
}: {
  value?: string;
  label?: string;
}) => {
  return (
    <Filter.Item value={value || 'assignedTo'}>
      <IconUser />
      {label || 'Assigned To'}
    </Filter.Item>
  );
};

export const SelectAttributionFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [assignedTo, setAssignedTo] = useQueryState<string[] | string>(
    queryKey || 'assignedTo',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'assignedTo'}>
      <SelectAttributionProvider
        mode={mode}
        value={assignedTo || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setAssignedTo(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectAttributionContent />
      </SelectAttributionProvider>
    </Filter.View>
  );
};

export const SelectAttributionFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
  label,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  label?: string;
}) => {
  const [assignedTo, setAssignedTo] = useQueryState<string[] | string>(
    queryKey || 'assignedTo',
  );
  const [open, setOpen] = useState(false);

  if (!assignedTo) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey || 'assignedTo'}>
      <Filter.BarName>
        <IconUser />
        {label ? label : !iconOnly && 'Assigned To'}
      </Filter.BarName>
      <SelectAttributionProvider
        mode={mode}
        value={assignedTo || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value && value.length > 0) {
            setAssignedTo(value as string[] | string);
          } else {
            setAssignedTo(null);
          }
          onValueChange?.(value);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'assignedTo'}>
              <SelectAttributionValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectAttributionContent />
          </Combobox.Content>
        </Popover>
      </SelectAttributionProvider>
    </Filter.BarItem>
  );
};

export const SelectAttributionInlineCell = React.forwardRef<
  React.ComponentRef<typeof RecordTableInlineCell.Trigger>,
  Omit<React.ComponentProps<typeof SelectAttributionProvider>, 'children'> &
  React.ComponentProps<typeof RecordTableInlineCell.Trigger> & {
    scope?: string;
    placeholder?: string;
    size?: AvatarProps['size'];
  }
>(
  (
    {
      mode,
      value,
      onValueChange,
      attribution,
      size = 'lg',
      scope,
      placeholder,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectAttributionProvider
        mode={mode}
        value={value}
        onValueChange={onValueChange}
        attribution={attribution}
        setOpen={setOpen}
      >
        <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
          <RecordTableInlineCell.Trigger
            ref={ref}
            {...props}
            className={cn(className, 'text-xs')}
          >
            <SelectAttributionValue
              placeholder={placeholder ?? ''}
              size={size}
            />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <SelectAttributionContent />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      </SelectAttributionProvider>
    );
  },
);

SelectAttributionInlineCell.displayName = 'SelectAttributionInlineCell';

export const SelectAttributionFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectAttributionProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAttributionProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        props.mode !== 'multiple' && setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectAttributionValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectAttributionContent />
        </Combobox.Content>
      </Popover>
    </SelectAttributionProvider>
  );
};

export const SelectAttributionDetail = ({
  onValueChange,
  className,
  size = 'xl',
  placeholder,
  value,
  ...props
}: Omit<React.ComponentProps<typeof SelectAttributionProvider>, 'children'> & {
  className?: string;
  size?: 'lg' | 'sm' | 'xl' | 'default' | 'xs';
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAttributionProvider
      value={value}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {value ? (
            <Button variant="ghost" className="w-full inline-flex">
              <SelectAttributionValue size={size} />
            </Button>
          ) : (
            <Combobox.TriggerBase className="font-medium">
              Add Owner <IconPlus />
            </Combobox.TriggerBase>
          )}
        </Popover.Trigger>
        <Combobox.Content>
          <SelectAttributionContent />
        </Combobox.Content>
      </Popover>
    </SelectAttributionProvider>
  );
};

export const SelectAttributionRoot = ({
  onValueChange,
  className,
  size,
  placeholder,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectAttributionProvider>, 'children'> & {
  className?: string;
  size?: 'lg' | 'sm' | 'xl' | 'default' | 'xs';
  placeholder?: string;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAttributionProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger
          className={cn('w-full inline-flex', className)}
          variant="outline"
        >
          <SelectAttributionValue size={size} placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectAttributionContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectAttributionProvider>
  );
};

export const SelectAttributionCustomDetail = ({
  onValueChange,
  className,
  size = 'lg',
  value,
  ...props
}: Omit<React.ComponentProps<typeof SelectAttributionProvider>, 'children'> & {
  className?: string;
  size?: 'lg' | 'sm' | 'xl' | 'default' | 'xs';
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAttributionProvider
      value={value}
      onValueChange={(value) => {
        onValueChange?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase asChild>
          <Button
            variant="ghost"
            className={cn('h-7 w-auto inline-flex', className)}
          >
            <SelectAttributionValue size={size} />
          </Button>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <SelectAttributionContent />
        </Combobox.Content>
      </Popover>
    </SelectAttributionProvider>
  );
};

export const SelectAttribution = Object.assign(SelectAttributionRoot, {
  Provider: SelectAttributionProvider,
  Value: SelectAttributionValue,
  Content: SelectAttributionContent,
  CommandItem: SelectAttributionCommandItem,
  NoAssigneeItem: SelectAttributionNoAssigneeItem,
  FilterItem: SelectAttributionFilterItem,
  FilterView: SelectAttributionFilterView,
  FilterBar: SelectAttributionFilterBar,
  InlineCell: SelectAttributionInlineCell,
  FormItem: SelectAttributionFormItem,
  Detail: SelectAttributionDetail,
  CustomDetail: SelectAttributionCustomDetail,
});
