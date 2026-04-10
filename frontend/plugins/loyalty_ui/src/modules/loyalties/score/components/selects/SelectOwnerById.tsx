import React, { useState, useMemo } from 'react';
import { cn, Combobox, Command, Form, Popover } from 'erxes-ui';
import { useQuery, gql } from '@apollo/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface CompanyItem {
  _id: string;
  primaryName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
}

interface UserDetails {
  fullName?: string;
  firstName?: string;
  lastName?: string;
}

interface UserItem {
  _id: string;
  email?: string;
  details?: UserDetails;
}

interface CpUserItem {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface SelectOwnerFormItemProps {
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

const GET_COMPANIES = gql`
  query ScoreCompaniesSimple($searchValue: String, $limit: Int) {
    companies(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        primaryName
        primaryEmail
        primaryPhone
      }
    }
  }
`;

const GET_USERS = gql`
  query ScoreUsersSimple($searchValue: String, $isActive: Boolean) {
    allUsers(searchValue: $searchValue, isActive: $isActive) {
      _id
      email
      details {
        fullName
        firstName
        lastName
      }
    }
  }
`;

const GET_CLIENT_PORTAL_USERS = gql`
  query ScoreClientPortalUsersSimple($filter: IClientPortalUserFilter) {
    getClientPortalUsers(filter: $filter) {
      list {
        _id
        firstName
        lastName
        email
        phone
      }
    }
  }
`;

// ─── Shared option renderer ───────────────────────────────────────────────────

const OptionList = ({
  options,
  value,
  onSelect,
}: {
  options: SelectOption[];
  value: string;
  onSelect: (val: string) => void;
}) => (
  <>
    {options.map((opt) => (
      <Command.Item
        key={opt.value}
        value={opt.value}
        onSelect={() => onSelect(opt.value)}
      >
        <span className="font-medium">{opt.label}</span>
        <Combobox.Check checked={value === opt.value} />
      </Command.Item>
    ))}
  </>
);

const SelectTrigger = ({
  selected,
  placeholder,
  className,
}: {
  selected?: SelectOption;
  placeholder?: string;
  className?: string;
}) => (
  <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
    {selected ? (
      <p className="font-medium text-sm">{selected.label}</p>
    ) : (
      <span className="text-accent-foreground/80">{placeholder}</span>
    )}
  </Combobox.Trigger>
);

// ─── Company ──────────────────────────────────────────────────────────────────

export const SelectCompanyFormItem = ({
  value,
  onValueChange,
  placeholder = 'Choose company',
  className,
}: SelectOwnerFormItemProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, loading } = useQuery<{ companies: { list: CompanyItem[] } }>(
    GET_COMPANIES,
    { variables: { searchValue: search || undefined, limit: 50 } },
  );

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.companies?.list || []).map((c) => ({
        value: c._id,
        label: c.primaryName || c.primaryEmail || c.primaryPhone || 'Unnamed',
      })),
    [data?.companies?.list],
  );

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <SelectTrigger
          selected={selected}
          placeholder={placeholder}
          className={className}
        />
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search companies..."
          />
          <Command.Empty>
            {loading ? 'Loading...' : 'No companies found'}
          </Command.Empty>
          <Command.List>
            <OptionList
              options={options}
              value={value}
              onSelect={(v) => {
                onValueChange(v);
                setOpen(false);
              }}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// ─── Team Member ──────────────────────────────────────────────────────────────

export const SelectUserFormItem = ({
  value,
  onValueChange,
  placeholder = 'Choose team member',
  className,
}: SelectOwnerFormItemProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, loading } = useQuery<{ allUsers: UserItem[] }>(GET_USERS, {
    variables: { searchValue: search || undefined, isActive: true },
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.allUsers || []).map((u) => ({
        value: u._id,
        label:
          u.details?.fullName ||
          [u.details?.firstName, u.details?.lastName]
            .filter(Boolean)
            .join(' ') ||
          u.email ||
          'Unnamed',
      })),
    [data?.allUsers],
  );

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <SelectTrigger
          selected={selected}
          placeholder={placeholder}
          className={className}
        />
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search team members..."
          />
          <Command.Empty>
            {loading ? 'Loading...' : 'No team members found'}
          </Command.Empty>
          <Command.List>
            <OptionList
              options={options}
              value={value}
              onSelect={(v) => {
                onValueChange(v);
                setOpen(false);
              }}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// ─── Client Portal User ───────────────────────────────────────────────────────

export const SelectClientPortalUserFormItem = ({
  value,
  onValueChange,
  placeholder = 'Choose client portal user',
  className,
}: SelectOwnerFormItemProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, loading } = useQuery<{
    getClientPortalUsers: { list: CpUserItem[] };
  }>(GET_CLIENT_PORTAL_USERS, {
    variables: { filter: { searchValue: search || undefined } },
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (data?.getClientPortalUsers?.list || []).map((u) => ({
        value: u._id,
        label:
          [u.firstName, u.lastName].filter(Boolean).join(' ') ||
          u.email ||
          u.phone ||
          'Unnamed',
      })),
    [data?.getClientPortalUsers?.list],
  );

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <SelectTrigger
          selected={selected}
          placeholder={placeholder}
          className={className}
        />
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search client portal users..."
          />
          <Command.Empty>
            {loading ? 'Loading...' : 'No client portal users found'}
          </Command.Empty>
          <Command.List>
            <OptionList
              options={options}
              value={value}
              onSelect={(v) => {
                onValueChange(v);
                setOpen(false);
              }}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
