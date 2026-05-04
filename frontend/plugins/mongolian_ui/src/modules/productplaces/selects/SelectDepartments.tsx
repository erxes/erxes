import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Combobox, Command, PopoverScoped } from 'erxes-ui';

const DEPARTMENTS_QUERY = gql`
  query departments(
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $status: String
    $withoutUserFilter: Boolean
  ) {
    departments(
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      status: $status
      withoutUserFilter: $withoutUserFilter
    ) {
      _id
      title
    }
  }
`;

type Department = {
  _id: string;
  title: string;
};

interface SelectDepartmentsContextType {
  value: string;
  onValueChange: (departmentId: string) => void;
  loading?: boolean;
  error?: any;
  departments?: Department[];
}

const SelectDepartmentsContext = createContext<SelectDepartmentsContextType | null>(null);

const useSelectDepartmentsContext = () => {
  const context = useContext(SelectDepartmentsContext);
  if (!context) {
    throw new Error(
      'useSelectDepartmentsContext must be used within SelectDepartmentsProvider',
    );
  }
  return context;
};

export const SelectDepartmentsProvider = ({
  value,
  onValueChange,
  ids = [],
  excludeIds,
  searchValue,
  status,
  withoutUserFilter,
  children,
}: {
  value: string;
  onValueChange: (departmentId: string) => void;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  status?: string;
  withoutUserFilter?: boolean;
  children: React.ReactNode;
}) => {
  const { data, loading, error } = useQuery(DEPARTMENTS_QUERY, {
    variables: {
      ids,
      excludeIds,
      searchValue,
      status,
      withoutUserFilter,
    },
  });

  const departments: Department[] = useMemo(
    () => data?.departments || [],
    [data],
  );

  const contextValue = useMemo(
    () => ({
      value: value || '',
      onValueChange,
      departments,
      loading,
      error,
    }),
    [value, onValueChange, departments, loading, error],
  );

  return (
    <SelectDepartmentsContext.Provider value={contextValue}>
      {children}
    </SelectDepartmentsContext.Provider>
  );
};

const SelectDepartmentsValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, departments } = useSelectDepartmentsContext();
  const selectedDepartment = departments?.find((d) => d._id === value);

  if (!selectedDepartment) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Choose department'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="font-medium text-sm">{selectedDepartment.title}</p>
    </div>
  );
};

const SelectDepartmentsItem = ({ department }: { department: Department }) => {
  const { onValueChange, value } = useSelectDepartmentsContext();

  return (
    <Command.Item
      value={department._id}
      onSelect={() => {
        onValueChange(department._id === value ? '' : department._id);
      }}
    >
      <span className="font-medium">{department.title}</span>
      <Combobox.Check checked={value === department._id} />
    </Command.Item>
  );
};

const SelectDepartmentsContent = () => {
  const { departments, loading, error } = useSelectDepartmentsContext();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          Error: {error.message}
        </div>
      );
    }

    return departments?.map((d) => (
      <SelectDepartmentsItem key={d._id} department={d} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search department" />
      <Command.Empty>
        <span className="text-muted-foreground">No departments found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectDepartmentsRoot = ({
  value,
  onChange,
  ids = [],
  excludeIds,
  searchValue,
  status,
  withoutUserFilter,
  disabled,
}: {
  value?: string;
  onChange: (departmentId: string) => void;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  status?: string;
  withoutUserFilter?: boolean;
  disabled?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleValueChange = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <SelectDepartmentsProvider
      value={value || ''}
      onValueChange={handleValueChange}
      ids={ids}
      excludeIds={excludeIds}
      searchValue={searchValue}
      status={status}
      withoutUserFilter={withoutUserFilter}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger disabled={disabled}>
          <SelectDepartmentsValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectDepartmentsContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectDepartmentsProvider>
  );
};

export default SelectDepartmentsRoot;
