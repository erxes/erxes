import { useState } from 'react';
import { IBranch, ISelectBranchesProviderProps } from '../types/Branch';
import { SelectBranchesContext } from '../contexts/SelectBranchesContext';
import { useDebounce } from 'use-debounce';
import { useSelectBranchesContext } from '../hooks/useSelectBranchesContext';
import { useBranches } from '../hooks/useBranches';
import {
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  SelectTree,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconGitBranch, IconPlus } from '@tabler/icons-react';
import { BranchBadge } from './BranchBadge';
import {
  CreateBranchForm,
  SelectBranchCreateContainer,
} from './CreateBranchForm';
import React from 'react';

export const SelectBranchesProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: ISelectBranchesProviderProps) => {
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [selectedBranches, setSelectedBranches] = useState<IBranch[]>([]);
  const branchIds = !value ? [] : Array.isArray(value) ? value : [value];

  const handleSelectCallback = (branch: IBranch) => {
    if (!branch) return;

    const isSingleMode = mode === 'single';
    const multipleValue = (value as string[]) || [];
    const isSelected = !isSingleMode && multipleValue.includes(branch._id);

    const newSelectedBranchIds = isSingleMode
      ? [branch._id]
      : isSelected
      ? multipleValue.filter((p) => p !== branch._id)
      : [...multipleValue, branch._id];

    const newSelectedBranches = isSingleMode
      ? [branch]
      : isSelected
      ? selectedBranches.filter((p) => p._id !== branch._id)
      : [...selectedBranches, branch];

    setSelectedBranches(newSelectedBranches);
    onValueChange?.(isSingleMode ? branch._id : newSelectedBranchIds);
  };

  return (
    <SelectBranchesContext.Provider
      value={{
        onSelect: handleSelectCallback,
        value,
        selectedBranches,
        setSelectedBranches,
        newBranchName,
        setNewBranchName,
        mode,
        branchIds,
      }}
    >
      {children}
    </SelectBranchesContext.Provider>
  );
};

export const SelectBranchesCommand = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { selectedBranches, branchIds } = useSelectBranchesContext();
  const [noBranchesSearchValue, setNoBranchesSearchValue] =
    useState<string>('');

  const {
    sortedBranches: branches,
    loading,
    error,
    handleFetchMore,
    totalCount,
  } = useBranches({
    variables: {
      searchValue: debouncedSearch,
    },
    skip:
      !!noBranchesSearchValue &&
      debouncedSearch.includes(noBranchesSearchValue),
    onCompleted(data) {
      const { totalCount } = data?.branchesMain || {};
      setNoBranchesSearchValue(totalCount === 0 ? debouncedSearch : '');
    },
  });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search branches"
        focusOnMount
      />
      <Command.List>
        {selectedBranches?.length > 0 && (
          <>
            <div className="flex flex-wrap justify-start p-2 gap-2">
              <BranchesList />
            </div>
            <Command.Separator />
          </>
        )}
        <SelectTree.Provider id={'select-branches'} ordered={!search}>
          <SelectBranchesCreate
            search={search}
            show={!disableCreateOption && !loading && !branches?.length}
          />
          <Combobox.Empty loading={loading} error={error} />
          {branches
            ?.filter((b) => !branchIds?.find((bId) => bId === b._id))
            .map((branch) => (
              <SelectBranchesItem
                key={branch._id}
                branch={{
                  ...branch,
                  hasChildren: branches.some((b) => b.parentId === branch._id),
                }}
              />
            ))}
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={branches?.length || 0}
            totalCount={totalCount}
          />
        </SelectTree.Provider>
      </Command.List>
    </Command>
  );
};

export const SelectBranchesCreate = ({
  search,
  show,
}: {
  search: string;
  show: boolean;
}) => {
  const { setNewBranchName } = useSelectBranchesContext();

  if (!search || !show) return null;

  return (
    <Command.Item
      onSelect={() => setNewBranchName(search)}
      className="font-medium"
    >
      <IconPlus />
      Create new branch: "{search}"
    </Command.Item>
  );
};

export const SelectBranchesItem = ({
  branch,
}: {
  branch: IBranch & { hasChildren: boolean };
}) => {
  const { onSelect, branchIds } = useSelectBranchesContext();
  const isSelected = branchIds?.some((b) => b === branch._id);
  return (
    <SelectTree.Item
      key={branch._id}
      _id={branch._id}
      name={branch.title}
      order={branch.order}
      hasChildren={branch.hasChildren}
      selected={isSelected}
      onSelect={() => onSelect(branch)}
    >
      <TextOverflowTooltip
        value={branch.title}
        className="flex-auto w-auto font-medium"
      />
    </SelectTree.Item>
  );
};

export const BranchesList = ({
  placeholder,
  renderAsPlainText,
  ...props
}: Omit<React.ComponentProps<typeof BranchBadge>, 'onClose'> & {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const { value, selectedBranches, setSelectedBranches, onSelect } =
    useSelectBranchesContext();

  const selectedBranchIds = Array.isArray(value) ? value : [value];

  if (!value || !value.length) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <>
      {selectedBranchIds.map((branchId) => (
        <BranchBadge
          key={branchId}
          branchId={branchId}
          branch={selectedBranches.find((b) => b._id === branchId)}
          renderAsPlainText={renderAsPlainText}
          variant={'secondary'}
          onCompleted={(branch) => {
            if (!branch) return;
            if (selectedBranchIds.includes(branch._id)) {
              setSelectedBranches([...selectedBranches, branch]);
            }
          }}
          onClose={() =>
            onSelect?.(
              selectedBranches.find((p) => p._id === branchId) as IBranch,
            )
          }
          {...props}
        />
      ))}
    </>
  );
};

export const SelectBranchesValue = () => {
  const { selectedBranches, mode } = useSelectBranchesContext();

  if (selectedBranches?.length > 1)
    return (
      <span className="text-muted-foreground">
        {selectedBranches.length} branches selected
      </span>
    );

  return (
    <BranchesList
      placeholder="Select branches"
      renderAsPlainText={mode === 'single'}
    />
  );
};

export const SelectBranchesContent = () => {
  const { newBranchName } = useSelectBranchesContext();

  if (newBranchName) {
    return (
      <SelectBranchCreateContainer>
        <CreateBranchForm />
      </SelectBranchCreateContainer>
    );
  }
  return <SelectBranchesCommand />;
};

export const SelectBranchesInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectBranchesProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectBranchesProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectBranchesValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectBranchesContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectBranchesProvider>
  );
};

const SelectBranchesBadgesView = () => {
  const { branchIds, selectedBranches, setSelectedBranches, onSelect } =
    useSelectBranchesContext();

  return (
    <div className="flex gap-2 flex-wrap">
      {branchIds?.map((bId) => (
        <BranchBadge
          key={bId}
          branchId={bId}
          onCompleted={(branch) => {
            if (!branch) return;
            if (branchIds.includes(branch._id)) {
              setSelectedBranches([...selectedBranches, branch]);
            }
          }}
          onClose={() =>
            onSelect?.(selectedBranches.find((p) => p._id === bId) as IBranch)
          }
        />
      ))}
    </div>
  );
};

export const SelectBranchesDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectBranchesProvider>, 'children'> &
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
      <SelectBranchesProvider
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
              Add Branches
              <IconPlus className="text-lg" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content className="mt-2">
            <SelectBranchesContent />
          </Combobox.Content>
        </Popover>
        <SelectBranchesBadgesView />
      </SelectBranchesProvider>
    );
  },
);

SelectBranchesDetail.displayName = 'SelectBranchesDetail';

export const SelectBranchesCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof SelectBranchesProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectBranchesProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconGitBranch />
            Branch
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectBranchesContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectBranchesProvider>
  );
};

export const SelectBranchesFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectBranchesProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <SelectBranchesProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBranchesValue />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectBranchesContent />
        </Combobox.Content>
      </Popover>
    </SelectBranchesProvider>
  );
};

export const SelectBranchesFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconGitBranch />
      {label}
    </Filter.Item>
  );
};

export const SelectBranchesFilterView = ({
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
      <SelectBranchesProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value);
          resetFilterState();
        }}
      >
        <SelectBranchesContent />
      </SelectBranchesProvider>
    </Filter.View>
  );
};

export const SelectBranchesFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
  label: string;
}) => {
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  if (!query) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconGitBranch />
        {label}
      </Filter.BarName>
      <SelectBranchesProvider
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
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={filterKey}>
              <SelectBranchesValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBranchesContent />
          </Combobox.Content>
        </Popover>
      </SelectBranchesProvider>
    </Filter.BarItem>
  );
};

export const SelectBranches = Object.assign(SelectBranchesProvider, {
  CommandBarItem: SelectBranchesCommandbarItem,
  Content: SelectBranchesContent,
  Command: SelectBranchesCommand,
  Item: SelectBranchesItem,
  Value: SelectBranchesValue,
  List: BranchesList,
  InlineCell: SelectBranchesInlineCell,
  FormItem: SelectBranchesFormItem,
  FilterItem: SelectBranchesFilterItem,
  FilterView: SelectBranchesFilterView,
  FilterBar: SelectBranchesFilterBar,
  Detail: SelectBranchesDetail,
});
