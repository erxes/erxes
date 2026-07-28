import { createContext, useContext, useState } from 'react';
import {
  IconCheck,
  IconLabel,
  IconLoader,
  IconPencil,
  IconPlus,
  IconTagMinus,
} from '@tabler/icons-react';
import { DealChipTrigger } from '@/deals/components/deal-selects/DealChipTrigger';
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
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  areIdListsEqual,
  rejectOnMutationError,
  useOptimisticField,
} from '@/deals/components/deal-selects/hooks/useOptimisticField';

export const SelectLabelsContext = createContext<ISelectLabelContext | null>(
  null,
);

export const useSelectLabelsContext = () => {
  const context = useContext(SelectLabelsContext);

  return context || ({} as ISelectLabelContext);
};

const getLabelIds = (value?: string[] | string) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const SelectLabelsProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: ISelectLabelProviderProps) => {
  const [newLabelName, setNewLabelName] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<IPipelineLabel[]>([]);
  const labelIds = getLabelIds(value);

  const handleSelectCallback = (label: IPipelineLabel) => {
    if (!label._id) return;

    const isSingleMode = mode === 'single';
    const multipleValue = getLabelIds(value);
    const isSelected = !isSingleMode && multipleValue.includes(label._id);

    let newSelectedLabelIds = [label._id];
    let newSelectedLabels = [label];

    if (!isSingleMode) {
      newSelectedLabelIds = isSelected
        ? multipleValue.filter((labelId) => labelId !== label._id)
        : [...multipleValue, label._id];
      newSelectedLabels = isSelected
        ? selectedLabels.filter(({ _id }) => _id !== label._id)
        : [...selectedLabels, label];
    }

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

export const SelectLabelsCommand = () => {
  const { t } = useTranslation('sales');
  const { labelIds, onSelect } = useSelectLabelsContext();

  const [pipelineId] = useQueryState('pipelineId');

  const {
    pipelineLabels = [],
    loading,
    error,
  } = usePipelineLabels({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const toggleLabel = (label: IPipelineLabel) => {
    if (!label._id) {
      return;
    }

    onSelect(label);
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
            {t('back')}
          </button>
          <h3 className="text-sm font-semibold text-gray-600">
            {editLabelId ? t('edit-label') : t('add-label')}
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
        <div className="flex flex-col items-center justify-center gap-2 px-4 pb-4 pt-6">
          <IconTagMinus className="size-6 text-muted-foreground" />
          <Combobox.Empty
            loading={loading}
            error={error}
            className="w-full [&>p]:p-2"
          />
        </div>

        <div className="px-3 pb-3">
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setEditLabelId(null);
              setShowForm(true);
            }}
          >
            <IconPlus size={16} />
            {t('create-new-label')}
          </Button>
        </div>
      </Command>
    );
  }
  if (loading) {
    return (
      <Command>
        <Command.Input placeholder={t('search-label')} />
        <div className="flex items-center gap-2">
          <IconLoader className="animate-spin" />
        </div>
      </Command>
    );
  } else
    return (
      <Command>
        <Command.Input placeholder={t('search-label')} />
        <Command.List className="px-1">
          {pipelineLabels.map((label) => {
            return (
              <Command.Item
                key={label._id}
                className={cn(
                  'flex items-center justify-between p-2 cursor-pointer my-1  ',
                  labelIds?.includes(label._id || '')
                    ? 'bg-blue-50 border-blue-300 rounded-md w-full'
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
          {t('create-new-label')}
        </Button>
      </Command>
    );
};

export const SelectLabelsValue = ({
  showLabels = false,
}: {
  showLabels?: boolean;
}) => {
  const { t } = useTranslation('sales');
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
            <IconLabel className="w-4 h-4 text-gray-400" /> {t('label')} +
            {(labelIds || []).length}
          </>
        )}
      </span>
    );
  }
  return <Combobox.Value placeholder={t('select-label')} />;
};

export const SelectLabelsContent = () => <SelectLabelsCommand />;

export const SelectLabelsFormItem = ({
  onValueChange,
  className,
  mode,
  ...props
}: Omit<React.ComponentProps<typeof SelectLabelsProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <SelectLabelsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        if (mode !== 'multiple') {
          setOpen(false);
        }
      }}
      mode={mode}
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
  const [query, setQuery] = useQueryState<string[] | string>(filterKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectLabelsProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          if (Array.isArray(value)) {
            const labelIds = value.filter((labelId): labelId is string =>
              Boolean(labelId),
            );

            setQuery(labelIds.length ? labelIds : null);
          } else {
            setQuery(value || null);
          }

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
  variant,
  scope,
  targetId,
  initialValue,
  showLabels,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  targetId?: string;
  initialValue?: string[];
  showLabels?: boolean;
}) => {
  const isCardVariant = variant === 'card' || variant === 'detail';

  const [urlQuery, setUrlQuery] = useQueryState<string[] | string>(filterKey);
  const [open, setOpen] = useState<boolean>(false);
  const { labelPipelineLabel } = usePipelineLabelLabel();
  const optimisticLabels = useOptimisticField({
    value: initialValue || [],
    resetKey: targetId,
    isEqual: areIdListsEqual,
    onCommit: (labelIds) => {
      if (!targetId) {
        return;
      }

      return rejectOnMutationError(
        labelPipelineLabel({
          variables: {
            targetId,
            labelIds,
          },
          refetchQueries: [
            {
              query: GET_DEAL_DETAIL,
              variables: { _id: targetId },
            },
          ],
        }),
      );
    },
  });

  const query = isCardVariant ? optimisticLabels.value : urlQuery;

  if (!query && !isCardVariant) {
    return null;
  }

  return (
    <SelectLabelsProvider
      mode={mode}
      value={query || []}
      onValueChange={(value) => {
        const nextValue = Array.isArray(value)
          ? value.filter((labelId): labelId is string => Boolean(labelId))
          : value;

        if (nextValue && nextValue.length > 0) {
          if (isCardVariant) {
            optimisticLabels.setValue(
              Array.isArray(nextValue) ? nextValue : [nextValue],
            );
          } else {
            setUrlQuery(nextValue);
          }
        } else {
          if (isCardVariant) {
            optimisticLabels.setValue([]);
          } else {
            setUrlQuery(null);
          }
        }
        if (mode === 'single') {
          setOpen(false);
        }
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        {variant === 'detail' ? (
          <DealChipTrigger>
            <SelectLabelsValue showLabels={showLabels} />
          </DealChipTrigger>
        ) : (
          <SelectTriggerOperation variant={variant || 'filter'}>
            <SelectLabelsValue showLabels={showLabels} />
          </SelectTriggerOperation>
        )}{' '}
        <SelectOperationContent variant={variant || 'filter'}>
          <SelectLabelsContent />
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
