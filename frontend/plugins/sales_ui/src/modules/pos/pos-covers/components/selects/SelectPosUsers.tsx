import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

import { IconUsers } from '@tabler/icons-react';
import { POS_USERS_QUERY } from '../../graphql/queries/posUsersQuery';
import { useQuery } from '@apollo/client';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface IUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  email?: string;
  isActive?: boolean;
  isOwner?: boolean;
  details?: {
    avatar?: string;
    fullName?: string;
    shortName?: string;
    birthDate?: string;
    position?: string;
    workStartedDate?: string;
    location?: string;
    description?: string;
    operatorPhone?: string;
  };
}

interface SelectUsersContextType {
  value: string;
  onValueChange: (user: string) => void;
  users?: IUser[];
  loading?: boolean;
}

const SelectUsersContext = createContext<SelectUsersContextType | null>(null);

const useSelectUsersContext = () => {
  const context = useContext(SelectUsersContext);
  if (!context) {
    throw new Error(
      'useSelectUsersContext must be used within SelectUsersProvider',
    );
  }
  return context;
};

export const SelectUsersProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  searchValue,
}: {
  value: string | string[];
  onValueChange: (user: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  searchValue?: string;
}) => {
  const { data, loading } = useQuery(POS_USERS_QUERY, {
    variables: {
      page: 1,
      perPage: 100,
      searchValue,
    },
  });

  const users = useMemo(() => data?.posUsers || [], [data?.posUsers]);

  const handleValueChange = useCallback(
    (user: string) => {
      if (!user) return;
      onValueChange?.(user);
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
      users,
      loading,
    }),
    [value, handleValueChange, users, loading, mode],
  );

  return (
    <SelectUsersContext.Provider value={contextValue}>
      {children}
    </SelectUsersContext.Provider>
  );
};

const SelectUsersValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, users } = useSelectUsersContext();
  const selectedUser = users?.find((user) => user._id === value);

  if (!selectedUser) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select user'}
      </span>
    );
  }

  const displayName =
    selectedUser.details?.fullName ||
    `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() ||
    selectedUser.username;

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{displayName}</p>
    </div>
  );
};

const SelectUsersCommandItem = ({ user }: { user: IUser }) => {
  const { onValueChange, value } = useSelectUsersContext();
  const { _id, username, firstName, lastName, details } = user || {};
  const isChecked = value.split(',').includes(_id);

  const displayName =
    details?.fullName ||
    `${firstName || ''} ${lastName || ''}`.trim() ||
    username;

  return (
    <Command.Item
      value={_id}
      onSelect={() => {
        onValueChange(_id);
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{displayName}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectUsersContent = () => {
  const { users, loading } = useSelectUsersContext();

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search users" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">Loading users...</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search users" />
      <Command.Empty>
        <span className="text-muted-foreground">No users found</span>
      </Command.Empty>
      <Command.List>
        {users?.map((user) => (
          <SelectUsersCommandItem key={user._id} user={user} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectUsersFilterItem = () => {
  return (
    <Filter.Item value="users">
      <IconUsers />
      Users
    </Filter.Item>
  );
};

export const SelectUsersFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  searchValue,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  searchValue?: string;
}) => {
  const [users, setUsers] = useQueryState<string[] | string>(
    queryKey || 'users',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'users'}>
      <SelectUsersProvider
        mode={mode}
        value={users || (mode === 'single' ? '' : [])}
        searchValue={searchValue}
        onValueChange={(value) => {
          setUsers(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectUsersContent />
      </SelectUsersProvider>
    </Filter.View>
  );
};

export const SelectUsersFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
  searchValue,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  searchValue?: string;
}) => {
  const [users, setUsers] = useQueryState<string[] | string>('users');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'users'}>
      <Filter.BarName>
        <IconUsers />
        Users
      </Filter.BarName>
      <SelectUsersProvider
        mode={mode}
        value={users || (mode === 'single' ? '' : [])}
        searchValue={searchValue}
        onValueChange={(value) => {
          if (value.length > 0) {
            setUsers(value as string[] | string);
          } else {
            setUsers(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'users'}>
              <SelectUsersValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectUsersContent />
          </Combobox.Content>
        </Popover>
      </SelectUsersProvider>
    </Filter.BarItem>
  );
};

export const SelectUsersFormItem = ({
  onValueChange,
  className,
  placeholder,
  searchValue,
  ...props
}: Omit<React.ComponentProps<typeof SelectUsersProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  searchValue?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectUsersProvider
      searchValue={searchValue}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectUsersValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectUsersContent />
        </Combobox.Content>
      </Popover>
    </SelectUsersProvider>
  );
};

SelectUsersFormItem.displayName = 'SelectUsersFormItem';

const SelectUsersRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
  searchValue,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  searchValue?: string;
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
    <SelectUsersProvider
      value={value}
      searchValue={searchValue}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectUsersValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectUsersContent />
        </SelectContent>
      </PopoverScoped>
    </SelectUsersProvider>
  );
};

export const SelectUsers = Object.assign(SelectUsersRoot, {
  Provider: SelectUsersProvider,
  Value: SelectUsersValue,
  Content: SelectUsersContent,
  FilterItem: SelectUsersFilterItem,
  FilterView: SelectUsersFilterView,
  FilterBar: SelectUsersFilterBar,
  FormItem: SelectUsersFormItem,
});
