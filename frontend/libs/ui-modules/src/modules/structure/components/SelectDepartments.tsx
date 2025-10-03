import React, { useState } from 'react';
import { SelectDepartmentsContext } from '../contexts/SelectDepartmentsContext';
import { useDebounce } from 'use-debounce';
import { useSelectDepartmentsContext } from '../hooks/useSelectDepartmentsContext';
import {
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  PopoverScoped,
  RecordTableInlineCell,
  Popover,
  SelectTree,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconFolder, IconPlus } from '@tabler/icons-react';
import {
  IDepartment,
  ISelectDepartmentsProviderProps,
} from '../types/Department';
import { useDepartments } from '../hooks/useDepartments';
import { DepartmentBadge } from './DepartmentBadge';
import {
  CreateDepartmentForm,
  SelectDepartmentsCreateContainer,
} from './CreateDepartmentForm';

export const SelectDepartmentsProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: ISelectDepartmentsProviderProps) => {
  const [newDepartmentName, setNewDepartmentName] = useState<string>('');
  const [selectedDepartments, setSelectedDepartments] = useState<IDepartment[]>(
    [],
  );
  const departmentIds = !value ? [] : Array.isArray(value) ? value : [value];

  const handleSelectCallback = (department: IDepartment) => {
    if (!department) return;

    const isSingleMode = mode === 'single';
    const multipleValue = (value as string[]) || [];
    const isSelected = !isSingleMode && multipleValue.includes(department._id);

    const newSelectedDepartmentIds = isSingleMode
      ? [department._id]
      : isSelected
      ? multipleValue.filter((d) => d !== department._id)
      : [...multipleValue, department._id];

    const newSelectedDepartments = isSingleMode
      ? [department]
      : isSelected
      ? selectedDepartments.filter((d) => d._id !== department._id)
      : [...selectedDepartments, department];

    setSelectedDepartments(newSelectedDepartments);
    onValueChange?.(isSingleMode ? department._id : newSelectedDepartmentIds);
  };

  return (
    <SelectDepartmentsContext.Provider
      value={{
        onSelect: handleSelectCallback,
        value,
        selectedDepartments,
        setSelectedDepartments,
        newDepartmentName,
        setNewDepartmentName,
        mode,
        departmentIds,
      }}
    >
      {children}
    </SelectDepartmentsContext.Provider>
  );
};

export const SelectDepartmentsCommand = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { selectedDepartments, departmentIds } = useSelectDepartmentsContext();
  const [noDepartmentsSearchValue, setNoDepartmentsSearchValue] =
    useState<string>('');

  const {
    sortedDepartments: departments,
    loading,
    error,
    handleFetchMore,
    totalCount,
  } = useDepartments({
    variables: {
      searchValue: debouncedSearch,
    },
    skip:
      !!noDepartmentsSearchValue &&
      debouncedSearch.includes(noDepartmentsSearchValue),
    onCompleted(data) {
      const { totalCount } = data?.departmentsMain || {};
      setNoDepartmentsSearchValue(totalCount === 0 ? debouncedSearch : '');
    },
  });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search departments"
        focusOnMount
      />

      <Command.List>
        {selectedDepartments?.length > 0 && (
          <>
            <div className="flex flex-wrap justify-start p-2 gap-2">
              <DepartmentsList />
            </div>
            <Command.Separator />
          </>
        )}
        <SelectTree.Provider id={'select-departments'} ordered={!search}>
          <SelectDepartmentsCreate
            search={search}
            show={!disableCreateOption && !loading && !departments?.length}
          />
          <Combobox.Empty loading={loading} error={error} />
          {departments
            ?.filter((d) => !departmentIds?.find((id) => id === d._id))
            .map((department) => (
              <SelectDepartmentsItem
                key={department._id}
                department={{
                  ...department,
                  hasChildren: departments.some(
                    (b) => b.parentId === department._id,
                  ),
                }}
              />
            ))}
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={departments?.length || 0}
            totalCount={totalCount}
          />
        </SelectTree.Provider>
      </Command.List>
    </Command>
  );
};

export const SelectDepartmentsCreate = ({
  search,
  show,
}: {
  search: string;
  show: boolean;
}) => {
  const { setNewDepartmentName } = useSelectDepartmentsContext();

  if (!search || !show) return null;

  return (
    <Command.Item
      onSelect={() => setNewDepartmentName(search)}
      className="font-medium"
    >
      <IconPlus />
      Create new department: "{search}"
    </Command.Item>
  );
};

export const SelectDepartmentsItem = ({
  department,
}: {
  department: IDepartment & { hasChildren: boolean };
}) => {
  const { onSelect, departmentIds } = useSelectDepartmentsContext();
  const isSelected = departmentIds?.some((d) => d === department._id);
  return (
    <SelectTree.Item
      key={department._id}
      _id={department._id}
      name={department.title}
      order={department.order || ''}
      hasChildren={department.hasChildren}
      selected={isSelected}
      onSelect={() => onSelect(department)}
    >
      <TextOverflowTooltip
        value={department.title}
        className="flex-auto w-auto font-medium"
      />
    </SelectTree.Item>
  );
};

export const DepartmentsList = ({
  placeholder,
  renderAsPlainText,
  ...props
}: Omit<React.ComponentProps<typeof DepartmentBadge>, 'onClose'> & {
  placeholder?: string;
  renderAsPlainText?: boolean;
}) => {
  const { value, selectedDepartments, setSelectedDepartments, onSelect } =
    useSelectDepartmentsContext();

  const selectedDepartmentIds = Array.isArray(value) ? value : [value];

  if (!value || !value.length) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <>
      {selectedDepartmentIds.map((departmentId) => (
        <DepartmentBadge
          key={departmentId}
          departmentId={departmentId}
          department={selectedDepartments.find((d) => d._id === departmentId)}
          renderAsPlainText={renderAsPlainText}
          variant={'secondary'}
          onCompleted={(department) => {
            if (!department) return;
            if (selectedDepartmentIds.includes(department._id)) {
              setSelectedDepartments([...selectedDepartments, department]);
            }
          }}
          onClose={() =>
            onSelect?.(
              selectedDepartments.find(
                (d) => d._id === departmentId,
              ) as IDepartment,
            )
          }
          {...props}
        />
      ))}
    </>
  );
};

export const SelectDepartmentsValue = () => {
  const { selectedDepartments, mode } = useSelectDepartmentsContext();

  if (selectedDepartments?.length > 1)
    return (
      <span className="text-muted-foreground">
        {selectedDepartments.length} departments selected
      </span>
    );

  return (
    <DepartmentsList
      placeholder="Select departments"
      renderAsPlainText={mode === 'single'}
    />
  );
};

export const SelectDepartmentsContent = () => {
  const { newDepartmentName } = useSelectDepartmentsContext();

  if (newDepartmentName) {
    return (
      <SelectDepartmentsCreateContainer>
        <CreateDepartmentForm />
      </SelectDepartmentsCreateContainer>
    );
  }
  return <SelectDepartmentsCommand />;
};

export const SelectDepartmentsInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectDepartmentsProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectDepartmentsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectDepartmentsValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectDepartmentsContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectDepartmentsProvider>
  );
};

const SelectDepartmentsBadgesView = () => {
  const {
    departmentIds,
    setSelectedDepartments,
    selectedDepartments,
    onSelect,
  } = useSelectDepartmentsContext();

  return (
    <div className="flex gap-2 flex-wrap">
      {departmentIds?.map((departmentId) => (
        <DepartmentBadge
          key={departmentId}
          departmentId={departmentId}
          onCompleted={(position) => {
            if (!position) return;
            if (departmentIds.includes(position._id)) {
              setSelectedDepartments([...selectedDepartments, position]);
            }
          }}
          onClose={() =>
            onSelect?.(
              selectedDepartments.find(
                (p) => p._id === departmentId,
              ) as IDepartment,
            )
          }
        />
      ))}
    </div>
  );
};

export const SelectDepartmentsDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectDepartmentsProvider>, 'children'> &
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
      <SelectDepartmentsProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        {...{ value, mode, options }}
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
              Add Departments
              <IconPlus className="text-lg" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content className="mt-2">
            <SelectDepartmentsContent />
          </Combobox.Content>
        </Popover>
        <SelectDepartmentsBadgesView />
      </SelectDepartmentsProvider>
    );
  },
);

SelectDepartmentsDetail.displayName = 'SelectDepartmentsDetail';

export const SelectDepartmentsCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectDepartmentsProvider>,
  'children'
>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectDepartmentsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconFolder />
            Department
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectDepartmentsContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectDepartmentsProvider>
  );
};

export const SelectDepartmentsFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectDepartmentsProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <SelectDepartmentsProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectDepartmentsValue />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectDepartmentsContent />
        </Combobox.Content>
      </Popover>
    </SelectDepartmentsProvider>
  );
};

export const SelectDepartmentsFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconFolder />
      {label}
    </Filter.Item>
  );
};

export const SelectDepartmentsFilterView = ({
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
      <SelectDepartmentsProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value);
          resetFilterState();
        }}
      >
        <SelectDepartmentsContent />
      </SelectDepartmentsProvider>
    </Filter.View>
  );
};

export const SelectDepartmentsFilterBar = ({
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
        <IconFolder />
        {label}
      </Filter.BarName>
      <SelectDepartmentsProvider
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
              <SelectDepartmentsValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectDepartmentsContent />
          </Combobox.Content>
        </Popover>
      </SelectDepartmentsProvider>
    </Filter.BarItem>
  );
};

export const SelectDepartments = Object.assign(SelectDepartmentsProvider, {
  CommandBarItem: SelectDepartmentsCommandbarItem,
  Content: SelectDepartmentsContent,
  Command: SelectDepartmentsCommand,
  Item: SelectDepartmentsItem,
  Value: SelectDepartmentsValue,
  List: DepartmentsList,
  InlineCell: SelectDepartmentsInlineCell,
  FormItem: SelectDepartmentsFormItem,
  FilterItem: SelectDepartmentsFilterItem,
  FilterView: SelectDepartmentsFilterView,
  FilterBar: SelectDepartmentsFilterBar,
  Detail: SelectDepartmentsDetail,
});
