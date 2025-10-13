import {
  Button,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  SelectTree,
  TextOverflowTooltip,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import {
  IPipelineLabel,
  ISelectLabelContext,
  ISelectLabelProviderProps,
} from '@/deals/types/pipelines';
import { IconLabel, IconPlus } from '@tabler/icons-react';
import { useContext, useState } from 'react';

import { LabelBadge } from './LabelBadge';
import React from 'react';
import { SelectOperationContent } from '@/deals/components/deal-selects/SelectOperation';
import { SelectTriggerOperation } from '@/deals/components/deal-selects/SelectOperation';
import { createContext } from 'react';
import { useDebounce } from 'use-debounce';
import { usePipelineLabels } from '@/deals/pipelines/hooks/usePipelineDetails';

export const SelectLabelsContext = createContext<ISelectLabelContext | null>(
  null,
);

export const useSelectLabelsContext = () => {
  const context = useContext(SelectLabelsContext);

  return context || ({} as ISelectLabelContext);
};

export const SelectLabelsProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: ISelectLabelProviderProps) => {
  const [newLabelName, setNewLabelName] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<IPipelineLabel[]>([]);
  const labelIds = !value ? [] : Array.isArray(value) ? value : [value];

  const handleSelectCallback = (label: IPipelineLabel) => {
    if (!label) return;

    const isSingleMode = mode === 'single';
    const multipleValue = (value as string[]) || [];
    const isSelected = !isSingleMode && multipleValue.includes(label._id || '');

    const newSelectedLabelIds = isSingleMode
      ? [label._id]
      : isSelected
      ? multipleValue.filter((p) => p !== label._id)
      : [...multipleValue, label._id];

    const newSelectedLabels = isSingleMode
      ? [label]
      : isSelected
      ? selectedLabels.filter((p) => p._id !== label._id)
      : [...selectedLabels, label];

    setSelectedLabels(newSelectedLabels);
    onValueChange?.(isSingleMode ? label._id : newSelectedLabelIds);
  };

  return (
    <SelectLabelsContext.Provider
      value={{
        onSelect: handleSelectCallback,
        value,
        selectedLabels,
        setSelectedLabels,
        newLabelName,
        setNewLabelName,
        mode,
        labelIds,
      }}
    >
      {children}
    </SelectLabelsContext.Provider>
  );
};

export const SelectLabelsCommand = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { selectedLabels, labelIds } = useSelectLabelsContext();
  const [noLabelsSearchValue] = useState<string>('');

  const { pipelineLabels, loading, error } = usePipelineLabels({
    variables: {
      searchValue: debouncedSearch,
    },
    skip:
      !!noLabelsSearchValue && debouncedSearch.includes(noLabelsSearchValue),
  });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search labels"
        focusOnMount
      />
      <Command.List>
        {selectedLabels?.length > 0 && (
          <>
            <div className="flex flex-wrap justify-start p-2 gap-2">
              <LabelsList />
            </div>
            <Command.Separator />
          </>
        )}
        <SelectTree.Provider id={'select-labels'} ordered={!search}>
          <SelectLabelsCreate
            search={search}
            show={!disableCreateOption && !loading && !pipelineLabels?.length}
          />
          <Combobox.Empty loading={loading} error={error} />
          {pipelineLabels
            ?.filter((label) => !labelIds?.find((bId) => bId === label._id))
            .map((label) => (
              <SelectLabelsItem
                key={label._id}
                label={{
                  ...label,
                }}
              />
            ))}
        </SelectTree.Provider>
      </Command.List>
    </Command>
  );
};

export const SelectLabelsCreate = ({
  search,
  show,
}: {
  search: string;
  show: boolean;
}) => {
  const { setNewLabelName } = useSelectLabelsContext();

  if (!search || !show) return null;

  return (
    <Command.Item
      onSelect={() => setNewLabelName(search)}
      className="font-medium"
    >
      <IconPlus />
      Create new label: "{search}"
    </Command.Item>
  );
};

export const SelectLabelsItem = ({ label }: { label: IPipelineLabel }) => {
  const { onSelect, labelIds } = useSelectLabelsContext();
  const isSelected = labelIds?.some((b) => b === label._id);
  return (
    <SelectTree.Item
      key={label._id}
      _id={label._id || ''}
      name={label.name}
      order={'1'}
      hasChildren={false}
      selected={isSelected}
      onSelect={() => onSelect(label)}
    >
      <TextOverflowTooltip
        value={label.name}
        className="flex-auto w-auto font-medium"
      />
    </SelectTree.Item>
  );
};

export const LabelsList = ({
  placeholder,
  renderAsPlainText,
  ...props
}: Omit<React.ComponentProps<typeof LabelBadge>, 'onClose'> & {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const { value, selectedLabels, setSelectedLabels, onSelect } =
    useSelectLabelsContext();

  const selectedLabelIds = Array.isArray(value) ? value : [value];

  if (!value || !value.length) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <>
      {selectedLabelIds.map((labelId) => (
        <LabelBadge
          key={labelId}
          labelId={labelId}
          label={selectedLabels.find((b) => b._id === labelId)}
          renderAsPlainText={renderAsPlainText}
          variant={'secondary'}
          onCompleted={(label) => {
            if (!label) return;
            if (selectedLabelIds.includes(label._id)) {
              setSelectedLabels([...selectedLabels, label]);
            }
          }}
          onClose={() =>
            onSelect?.(
              selectedLabels.find((p) => p._id === labelId) as IPipelineLabel,
            )
          }
          {...props}
        />
      ))}
    </>
  );
};

export const SelectLabelsValue = () => {
  const { selectedLabels, mode } = useSelectLabelsContext();

  if (selectedLabels?.length > 1)
    return (
      <span className="text-muted-foreground">
        {selectedLabels.length} labels selected
      </span>
    );

  return (
    <LabelsList
      placeholder="Select labels"
      renderAsPlainText={mode === 'single'}
    />
  );
};

export const SelectLabelsContent = () => {
  return <SelectLabelsCommand />;
};

export const SelectLabelsInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectLabelsProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectLabelsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectLabelsValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectLabelsContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectLabelsProvider>
  );
};

const SelectLabelsBadgesView = () => {
  const { labelIds, selectedLabels, setSelectedLabels, onSelect } =
    useSelectLabelsContext();

  return (
    <div className="flex gap-2 flex-wrap">
      {labelIds?.map((lId) => (
        <LabelBadge
          key={lId}
          labelId={lId}
          onCompleted={(label) => {
            if (!label) return;
            if (labelIds.includes(label._id || '')) {
              setSelectedLabels([...selectedLabels, label]);
            }
          }}
          onClose={() =>
            onSelect?.(
              selectedLabels.find((p) => p._id === lId) as IPipelineLabel,
            )
          }
        />
      ))}
    </div>
  );
};

export const SelectLabelsDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectLabelsProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(
  (
    { onValueChange, scope, value, mode, options, className, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectLabelsProvider
        onValueChange={(value) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(value);
        }}
        value={value}
        {...props}
        mode={mode}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              className={cn(
                'w-min inline-flex text-sm font-medium shadow-xs',
                className,
              )}
              variant="outline"
            >
              Add Labels
              <IconPlus className="text-lg" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content className="mt-2">
            <SelectLabelsContent />
          </Combobox.Content>
        </Popover>
        <SelectLabelsBadgesView />
      </SelectLabelsProvider>
    );
  },
);

SelectLabelsDetail.displayName = 'SelectLabelsDetail';

export const SelectLabelsCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof SelectLabelsProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectLabelsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconLabel />
            Label
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectLabelsContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectLabelsProvider>
  );
};

export const SelectLabelsFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectLabelsProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <SelectLabelsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectLabelsValue />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectLabelsContent />
        </Combobox.Content>
      </Popover>
    </SelectLabelsProvider>
  );
};

export const SelectLabelsFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconLabel />
      {label}
    </Filter.Item>
  );
};

export const SelectLabelsFilterView = ({
  mode,
  filterKey,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectLabelsProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value as any);
          resetFilterState();
        }}
      >
        <SelectLabelsContent />
      </SelectLabelsProvider>
    </Filter.View>
  );
};

export const SelectLabelsFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
  variant,
  scope,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
  label: string;
  variant?: string;
  scope?: string;
}) => {
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  if (!query && variant !== 'card') {
    return null;
  }

  return (
    // <Filter.BarItem queryKey={filterKey}>
    //   <Filter.BarName>
    //     <IconLabel />
    //     {label}
    //   </Filter.BarName>
    <SelectLabelsProvider
      mode={mode}
      value={query || []}
      onValueChange={(value) => {
        if (value && value.length > 0) {
          setQuery(value as string[]);
        } else {
          setQuery(null);
        }
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="filter">
          <SelectLabelsValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="filter">
          <SelectLabelsContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectLabelsProvider>
    // </Filter.BarItem>
  );
};

export const SelectLabels = Object.assign(SelectLabelsProvider, {
  FormItem: SelectLabelsFormItem,
  FilterItem: SelectLabelsFilterItem,
  FilterView: SelectLabelsFilterView,
  FilterBar: SelectLabelsFilterBar,
});
