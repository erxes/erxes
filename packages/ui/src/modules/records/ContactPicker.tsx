import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { Combobox } from '../../components/combobox';
import { Popover } from '../../components/popover';
import { Spinner } from '../../components/spinner';
import { cn } from '../../lib/utils';
import { readImage } from '../../utils/core';
import { PopoverScoped } from '../hotkey/components/PopoverScoped';
import { EntityPicker } from '../pickers/EntityPicker';
import { ContactLink } from './ContactLink';
import {
  companyTitle,
  type ContactQueries,
  type ContactSearch,
  type ContactSearchQueries,
  customerTitle,
} from './contacts';

/** Which contacts a picker lists: core's customers or its companies. */
export type TContactKind = 'customer' | 'company';

interface IContactOption {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** Up to 20 customers or companies: those matching `search`, or the ones with `ids`. */
const useContactRows = (
  contacts: ContactSearchQueries,
  kind: TContactKind,
  { search, ids }: ContactSearch,
) => {
  const input = { search: search || undefined, ids };
  const enabled = !ids || ids.length > 0;

  const customers = useQuery({
    ...contacts.customers(input),
    enabled: enabled && kind === 'customer',
    placeholderData: (previous) => previous,
  });

  const companies = useQuery({
    ...contacts.companies(input),
    enabled: enabled && kind === 'company',
    placeholderData: (previous) => previous,
  });

  if (kind === 'customer') {
    return {
      data: customers.data?.data.map((customer): IContactOption => ({
        id: customer.id,
        name: customerTitle(customer),
        avatarUrl: customer.avatarUrl,
      })),
      isPending: customers.isPending,
      error: customers.error,
    };
  }

  return {
    data: companies.data?.data.map((company): IContactOption => ({
      id: company.id,
      name: companyTitle(company),
      avatarUrl: company.avatarUrl,
    })),
    isPending: companies.isPending,
    error: companies.error,
  };
};

/**
 * A picker's searchable list of customers or companies, the picked first.
 * Searched on the server; `contacts` is `contactSearchQueries` from
 * `@erxes/core-contract/client`.
 */
export const SelectContactContent = ({
  kind,
  value,
  onValueChange,
  contacts,
  multiple = true,
  noneLabel,
}: {
  kind: TContactKind;
  value: string[];
  onValueChange: (ids: string[]) => void;
  contacts: ContactSearchQueries;
  multiple?: boolean;
  noneLabel?: string;
}) => {
  const [search, setSearch] = useState('');
  const [debounced] = useDebounce(search.trim(), 500);
  const placeholder = kind === 'customer' ? 'Unnamed customer' : 'Unnamed company';

  const selected = useContactRows(contacts, kind, { ids: value });
  const matches = useContactRows(contacts, kind, { search: debounced });

  const found = matches.data ?? [];

  // The picked ones the search did not find stay listed.
  const items = [
    ...(selected.data ?? []).filter(
      (option) => value.includes(option.id) && !found.some((match) => match.id === option.id),
    ),
    ...found,
  ];

  return (
    <EntityPicker
      multiple={multiple}
      noneLabel={noneLabel}
      items={items}
      itemKey={(option) => ({ id: option.id, label: option.name })}
      renderItem={(option) => (
        <>
          <Avatar>
            <Avatar.Image src={readImage(option.avatarUrl ?? undefined)} />
            <Avatar.Fallback>{option.name.charAt(0)}</Avatar.Fallback>
          </Avatar>
          <Combobox.Value value={option.name} placeholder={placeholder} />
        </>
      )}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={setSearch}
      loading={matches.isPending}
      error={matches.error ?? selected.error}
    />
  );
};

const ContactRelationTriggerLabel = ({
  saving,
  moreCount,
  hasLinks,
  addLabel,
}: {
  saving: boolean;
  moreCount: number;
  hasLinks: boolean;
  addLabel: string;
}) => {
  if (saving) return <Spinner size="sm" />;

  if (moreCount > 0) return <span className="font-normal">+{moreCount}</span>;

  return (
    <>
      <IconPlus aria-hidden="true" />
      {!hasLinks && <span className="font-normal">{addLabel}</span>}
    </>
  );
};

type RelationProps = {
  kind: TContactKind;
  value: string[];
  /** Picks several unless `multiple` is false; then a pick replaces the one linked. */
  onValueChange?: (ids: string[]) => void;
  /** `contactQueries` and `contactSearchQueries` from `@erxes/core-contract/client`. */
  contacts: ContactQueries;
  contactSearch: ContactSearchQueries;
  multiple?: boolean;
  scope: string;
  disabled?: boolean;
};

/** The button after the first chip: `+N` more, or add, opening the picker. */
const ContactRelationPopover = ({
  kind,
  value,
  contacts,
  contactSearch,
  multiple = true,
  scope,
  disabled = false,
  onValueChange,
}: RelationProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [open, setOpen] = useState(false);
  const hasLinks = value.length > 0;
  const moreCount = Math.max(0, value.length - 1);

  const addLabel =
    kind === 'company' ? t('add-company', 'Add company') : t('add-customer', 'Add customer');

  const editLabel =
    kind === 'company'
      ? t('edit-companies', 'Edit companies')
      : t('edit-customers', 'Edit customers');

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button
            variant={moreCount > 0 ? 'secondary' : 'ghost'}
            size="xs"
            tone="muted"
            data-panel-inline=""
            disabled={disabled}
            aria-label={hasLinks ? editLabel : addLabel}
            className={cn(
              'shrink-0 [&>svg]:size-3.5',
              hasLinks &&
                !moreCount &&
                'opacity-0 group-hover/relations:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100',
            )}
          />
        }
      >
        <ContactRelationTriggerLabel
          saving={disabled}
          moreCount={moreCount}
          hasLinks={hasLinks}
          addLabel={addLabel}
        />
      </Popover.Trigger>
      <Combobox.Content>
        {onValueChange ? (
          <SelectContactContent
            kind={kind}
            value={value}
            contacts={contactSearch}
            multiple={multiple}
            onValueChange={(ids) => {
              if (disabled) return;

              onValueChange(ids);

              if (!multiple) setOpen(false);
            }}
          />
        ) : (
          <div className="flex flex-col items-start gap-1 p-2">
            {value.map((id) => (
              <ContactLink
                key={id}
                contentType={kind === 'company' ? 'core:company' : 'core:customer'}
                contentId={id}
                contacts={contacts}
              />
            ))}
          </div>
        )}
      </Combobox.Content>
    </PopoverScoped>
  );
};

/**
 * A record's customers or companies in a side panel field.
 * Put it in a `cell={false}` field. The first shows as a chip, then a muted button adds, changes, or shows the rest
 * (`+N`). Without `onValueChange` it only shows them. Core's panels and plugin
 * records draw contacts with it.
 */
export const ContactRelationInput = (props: RelationProps) => {
  const { kind, value, contacts, onValueChange } = props;
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  let control = null;

  if (onValueChange || value.length > 1) {
    control = <ContactRelationPopover {...props} />;
  } else if (!value.length) {
    control = (
      <span className="px-1 text-xs text-muted-foreground">
        {t('not-specified', 'Not specified')}
      </span>
    );
  }

  return (
    <div className="group/relations flex min-h-7 min-w-0 items-center gap-1 px-1">
      {value.slice(0, 1).map((id) => (
        <div key={id} className="flex min-w-0 overflow-hidden">
          <ContactLink
            contentType={kind === 'company' ? 'core:company' : 'core:customer'}
            contentId={id}
            contacts={contacts}
          />
        </div>
      ))}
      {control}
    </div>
  );
};
