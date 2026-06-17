import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useApolloClient } from '@apollo/client';
import {
  IconCheck,
  IconLabel,
  IconLoader,
  IconPencil,
  IconPlus,
  IconTagMinus,
} from '@tabler/icons-react';
import LabelForm from '@/deals/cards/components/detail/overview/label/LabelForm';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import {
  usePipelineLabelLabel,
  usePipelineLabels,
} from '@/deals/pipelines/hooks/usePipelineDetails';
import {
  IPipelineLabel,
  ISelectLabelContext,
  ISelectLabelProviderProps,
} from '@/deals/types/pipelines';
import {
  Button,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  SelectOperationContent,
  SelectTree,
  SelectTriggerOperation,
  SelectTriggerVariant,
  TextOverflowTooltip,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

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

export const SelectLabelsCommand = ({ targetId }: { targetId?: string }) => {
  const { labelPipelineLabel } = usePipelineLabelLabel();
  const { labelIds, onSelect } = useSelectLabelsContext();
  const client = useApolloClient();

  const [pipelineId] = useQueryState('pipelineId');

  const {
    pipelineLabels = [],
    loading,
    error,
  } = usePipelineLabels({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const updateDealLabelsInCache = (dealId: string, nextLabelIds: string[]) => {
    const cacheId = client.cache.identify({ __typename: 'Deal', _id: dealId });

    if (!cacheId) {
      return;
    }

    const nextLabels = nextLabelIds
      .map((id) => {
        const found = pipelineLabels.find(
          (item: IPipelineLabel) => item._id === id,
        );

        return found
          ? {
              __typename: 'SalesPipelineLabel' as const,
              _id: found._id,
              name: found.name,
              colorCode: found.colorCode,
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    client.cache.modify({
      id: cacheId,
      fields: {
        labelIds: () => nextLabelIds,
        labels: () => nextLabels,
      },
    });
  };

  const toggleLabel = (label: IPipelineLabel) => {
    if (!label._id) {
      return;
    }

    let newLabelIds = Array.isArray(labelIds) ? [...labelIds] : [];

    if (newLabelIds.includes(label._id)) {
      newLabelIds = newLabelIds.filter((id) => id !== label._id);
    } else {
      newLabelIds.push(label._id);
    }

    onSelect(label);

    if (targetId) {
      updateDealLabelsInCache(targetId, newLabelIds);

      labelPipelineLabel({
        variables: {
          targetId: targetId,
          labelIds: newLabelIds,
        },
        update: () => {
          updateDealLabelsInCache(targetId, newLabelIds);
        },
        refetchQueries: [
          {
            query: GET_DEAL_DETAIL,
            variables: { _id: targetId },
          },
        ],
      });
    }
  };

  const [editLabelId, setEditLabelId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <>
        <div className="flex items-center justify-between border-b px-2 py-2">
          <button
            onClick={() => setShowForm(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            Back
          </button>
          <h3 className="text-sm font-semibold text-gray-600">
            {editLabelId ? 'Edit Label' : 'Add Label'}
          </h3>
          <span />
        </div>
        <LabelForm
          onSuccess={() => {
            setShowForm(false);
            setEditLabelId(null);
          }}
          labelId={editLabelId}
        />
      </>
    );
  }
  if (pipelineLabels.length === 0) {
    return (
      <Command>
        <div className="flex relative items-center justify-center -mb-5">
          <IconTagMinus className="mb-10 absolute" />
          <Combobox.Empty loading={loading} error={error} />
        </div>

        <Button
          type="button"
          className="w-[90%] mx-auto mb-2"
          onClick={() => {
            setEditLabelId(null);
            setShowForm(true);
          }}
        >
          <IconPlus size={16} />
          Create a new label
        </Button>
      </Command>
    );
  }
  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search label" />
        <div className="flex items-center gap-2">
          <IconLoader className="animate-spin" />
        </div>
      </Command>
    );
  } else
    return (
      <Command>
        <Command.Input placeholder="Search label" />
        <Command.List className="px-1">
          {pipelineLabels.map((label) => {
            return (
              <Command.Item
                key={label._id}
                className={cn(
                  'flex items-center justify-between p-2 cursor-pointer my-1  ',
                  labelIds?.includes(label._id || '')
                    ? 'bg-blue-50 border-blue-300 rounded-md w-[100%]'
                    : '',
                )}
                onSelect={() => toggleLabel(label)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.colorCode }}
                  />
                  <span className="text-sm">{label.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {labelIds?.includes(label._id || '') && (
                    <IconCheck className="w-4 h-4 text-green-600" />
                  )}
                  <IconPencil
                    className="w-5 h-5 cursor-pointer text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditLabelId(label._id || '');
                      setShowForm(true);
                    }}
                  />
                </div>
              </Command.Item>
            );
          })}
        </Command.List>
        <Button
          type="button"
          className="w-[90%] mx-auto mb-2"
          onClick={() => {
            setEditLabelId(null);
            setShowForm(true);
          }}
        >
          <IconPlus size={16} />
          Create a new label
        </Button>
      </Command>
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

export const SelectLabelsValue = ({
  showLabels = false,
}: {
  showLabels?: boolean;
}) => {
  const [pipelineId] = useQueryState('pipelineId');
  const { pipelineLabels = [] } = usePipelineLabels({
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const { labelIds } = useSelectLabelsContext();
  const selectedIds = new Set(labelIds ?? []);

  if ((labelIds || [])?.length !== 0) {
    return (
      <span className="text-muted-foreground flex items-center gap-1 -ml-1">
        {showLabels ? (
          <>
            <IconLabel className="w-4 h-4 text-gray-400" />
            {pipelineLabels
              .filter((label) => label._id && selectedIds.has(label._id))
              .map((label) => label.name)
              .join(', ')}
          </>
        ) : (
          <>
            <IconLabel className="w-4 h-4 text-gray-400" /> Label +
            {(labelIds || []).length}
          </>
        )}
      </span>
    );
  }
  return <Combobox.Value placeholder="Select Label" />;
};

export const SelectLabelsContent = ({ targetId }: { targetId?: string }) => {
  return <SelectLabelsCommand targetId={targetId} />;
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

export const SelectLabelsDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectLabelsProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(({ onValueChange, scope, value, mode, className, ...props }, ref) => {
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
        <Combobox.Content className="mt-2">
          <SelectLabelsContent />
        </Combobox.Content>
      </Popover>
    </SelectLabelsProvider>
  );
});

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
  targetId,
  initialValue,
  showLabels,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
  label: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  targetId?: string;
  initialValue?: string[];
  showLabels?: boolean;
}) => {
  const isCardVariant = variant === 'card';

  const [localQuery, setLocalQuery] = useState<string[]>(initialValue || []);
  const [urlQuery, setUrlQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);
  const prevInitialValueRef = useRef<string[]>(initialValue || []);

  useEffect(() => {
    if (!isCardVariant || !initialValue) return;
    const prev = prevInitialValueRef.current;
    const contentsChanged =
      prev.length !== initialValue.length ||
      !prev.every((id) => initialValue.includes(id));
    if (contentsChanged) {
      prevInitialValueRef.current = initialValue;
      setLocalQuery(initialValue);
    }
  }, [initialValue, isCardVariant]);

  const query = isCardVariant ? localQuery : urlQuery;

  if (!query && variant !== 'card') {
    return null;
  }

  return (
    <SelectLabelsProvider
      mode={mode}
      value={query || []}
      onValueChange={(value) => {
        if (value && value.length > 0) {
          if (isCardVariant) {
            setLocalQuery(value as string[]);
          } else {
            setUrlQuery(value as string[]);
          }
        } else {
          if (isCardVariant) {
            setLocalQuery([]);
          } else {
            setUrlQuery(null);
          }
        }
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant || 'filter'}>
          <SelectLabelsValue showLabels={showLabels} />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant || 'filter'}>
          <SelectLabelsContent targetId={targetId} />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectLabelsProvider>
  );
};

export const SelectLabels = Object.assign(SelectLabelsProvider, {
  FormItem: SelectLabelsFormItem,
  FilterItem: SelectLabelsFilterItem,
  FilterView: SelectLabelsFilterView,
  FilterBar: SelectLabelsFilterBar,
});
