import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Combobox, Command, PopoverScoped } from 'erxes-ui';

const BRANCHES_QUERY = gql`
  query branches(
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $status: String
    $withoutUserFilter: Boolean
  ) {
    branches(
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

type Branch = {
  _id: string;
  title: string;
};

interface SelectBranchesContextType {
  value: string;
  onValueChange: (branchId: string) => void;
  loading?: boolean;
  error?: any;
  branches?: Branch[];
}

const SelectBranchesContext = createContext<SelectBranchesContextType | null>(null);

const useSelectBranchesContext = () => {
  const context = useContext(SelectBranchesContext);
  if (!context) {
    throw new Error(
      'useSelectBranchesContext must be used within SelectBranchesProvider',
    );
  }
  return context;
};

export const SelectBranchesProvider = ({
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
  onValueChange: (branchId: string) => void;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  status?: string;
  withoutUserFilter?: boolean;
  children: React.ReactNode;
}) => {
  const { data, loading, error } = useQuery(BRANCHES_QUERY, {
    variables: {
      ids,
      excludeIds,
      searchValue,
      status,
      withoutUserFilter,
    },
  });

  const branches: Branch[] = useMemo(() => data?.branches || [], [data]);

  const contextValue = useMemo(
    () => ({
      value: value || '',
      onValueChange,
      branches,
      loading,
      error,
    }),
    [value, onValueChange, branches, loading, error],
  );

  return (
    <SelectBranchesContext.Provider value={contextValue}>
      {children}
    </SelectBranchesContext.Provider>
  );
};

const SelectBranchesValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, branches } = useSelectBranchesContext();
  const selectedBranch = branches?.find((b) => b._id === value);

  if (!selectedBranch) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Choose branch'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="font-medium text-sm">{selectedBranch.title}</p>
    </div>
  );
};

const SelectBranchesItem = ({ branch }: { branch: Branch }) => {
  const { onValueChange, value } = useSelectBranchesContext();

  return (
    <Command.Item
      value={branch._id}
      onSelect={() => {
        onValueChange(branch._id === value ? '' : branch._id);
      }}
    >
      <span className="font-medium">{branch.title}</span>
      <Combobox.Check checked={value === branch._id} />
    </Command.Item>
  );
};

const SelectBranchesContent = () => {
  const { branches, loading, error } = useSelectBranchesContext();

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

    return branches?.map((b) => (
      <SelectBranchesItem key={b._id} branch={b} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search branch" />
      <Command.Empty>
        <span className="text-muted-foreground">No branches found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectBranchesRoot = ({
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
  onChange: (branchId: string) => void;
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
    <SelectBranchesProvider
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
          <SelectBranchesValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectBranchesContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectBranchesProvider>
  );
};

export default SelectBranchesRoot;
