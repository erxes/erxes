import { useState, useMemo } from 'react';
import { cn, Combobox, Command, Form, Popover } from 'erxes-ui';
import { useQuery, gql } from '@apollo/client';
import { useTranslation } from 'react-i18next';

// Customer / company / team-member owners use the shared `ui-modules` selects
// (see SelectOwnerByType). Client portal users have no ready-made select there,
// so the lightweight one below is kept for that owner type.

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
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

// ─── Client Portal User ───────────────────────────────────────────────────────

export const SelectClientPortalUserFormItem = ({
  value,
  onValueChange,
  placeholder,
  className,
}: SelectOwnerFormItemProps) => {
  const { t } = useTranslation('loyalty');
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
          t('unnamed'),
      })),
    [data?.getClientPortalUsers?.list, t],
  );

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <SelectTrigger
          selected={selected}
          placeholder={placeholder ?? t('choose-client-portal-user')}
          className={className}
        />
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t('search-cp-users')}
          />
          <Command.Empty>
            {loading ? t('loading') : t('no-cp-users-found')}
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
