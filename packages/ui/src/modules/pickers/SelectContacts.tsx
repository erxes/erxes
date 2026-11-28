import { IconBuilding, IconUser } from '@tabler/icons-react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Avatar } from 'erxes-ui/components/avatar';
import { Combobox } from 'erxes-ui/components/combobox';
import { readImage } from 'erxes-ui/utils/core';
import {
  type CompanyContact,
  type ContactSearch,
  type ContactSearchQueries,
  companyTitle,
  type CustomerContact,
  customerTitle,
} from 'erxes-ui/modules/records/contacts';
import { useRowsById } from './rowsById';
import { pickerFamily } from './selectFamilyParts';

/** Where the contact pickers read core's customers and companies. */
export interface ContactSource {
  /** `contactSearchQueries` from `@erxes/core-contract/client`. */
  contacts: ContactSearchQueries;
}

type Rows<T> = (input: ContactSearch) => UseQueryOptions<{ data: T[] }, Error, { data: T[] }>;

/** Contacts by id. */
const useContactsById = <T extends { id: string }>(rows: Rows<T>, ids: string[]) =>
  useRowsById((sorted) => rows({ ids: sorted }), ids);

/** The contacts matching what is typed, half a second after typing stops. */
const useContactSearch = <T,>(rows: Rows<T>, search: string) => {
  const [term] = useDebounce(search, 500);
  const query = useQuery(rows({ search: term || undefined }));

  return { items: query.data?.data ?? [], loading: query.isPending, error: query.error };
};

const ContactLabel = ({ title, avatarUrl }: { title: string; avatarUrl: string | null }) => (
  <span className="flex min-w-0 items-center gap-2">
    <Avatar size="lg">
      <Avatar.Image src={readImage(avatarUrl)} />
      <Avatar.Fallback>{title.charAt(0)}</Avatar.Fallback>
    </Avatar>
    <span className="truncate">{title}</span>
  </span>
);

const CustomerLabel = ({ item }: { item: CustomerContact }) => (
  <ContactLabel title={customerTitle(item) || item.id} avatarUrl={item.avatarUrl} />
);

const CompanyLabel = ({ item }: { item: CompanyContact }) => (
  <ContactLabel title={companyTitle(item) || item.id} avatarUrl={item.avatarUrl} />
);

/**
 * Picks core's customers in a table cell, a form field or a filter.
 * 3.x's `SelectCustomer`. Each takes `contacts` (`contactSearchQueries` from `@erxes/core-contract/client`), `value`
 * and `onValueChange`; `mode="multiple"` picks several.
 */
export const SelectCustomer = pickerFamily<ContactSource, CustomerContact>({
  name: 'select-customer',
  icon: IconUser,
  useById: ({ contacts }, ids) => useContactsById(contacts.customers, ids),
  useList: ({ contacts }, search) => useContactSearch(contacts.customers, search),
  serverSearch: true,
  itemKey: (customer) => ({ id: customer.id, label: customerTitle(customer) }),
  Item: CustomerLabel,
  useTexts: () => {
    const { t } = useTranslation('ui', { keyPrefix: 'customer' });

    return {
      search: t('search', 'Search customers'),
      placeholder: t('select', 'Select Customers'),
      count: (count) => t('selected', '{{count}} customers', { count }),
    };
  },
});

/**
 * Picks core's companies in a table cell, a form field or a filter.
 * 3.x's `SelectCompany`. Each takes `contacts` (`contactSearchQueries` from `@erxes/core-contract/client`), `value`
 * and `onValueChange`; `mode="multiple"` picks several.
 */
export const SelectCompany = pickerFamily<ContactSource, CompanyContact>({
  name: 'select-company',
  icon: IconBuilding,
  useById: ({ contacts }, ids) => useContactsById(contacts.companies, ids),
  useList: ({ contacts }, search) => useContactSearch(contacts.companies, search),
  serverSearch: true,
  itemKey: (company) => ({ id: company.id, label: companyTitle(company) }),
  Item: CompanyLabel,
  useTexts: () => {
    const { t } = useTranslation('ui', { keyPrefix: 'company' });

    return {
      search: t('search', 'Search companies'),
      placeholder: t('select', 'Select Companies'),
      count: (count) => t('selected', '{{count}} companies', { count }),
    };
  },
});

/** Contacts as a row of up to three avatars and a title: the name, or how many there are. */
const ContactsInline = <T extends { id: string; avatarUrl: string | null }>({
  rows,
  ids,
  titleOf,
  count,
  placeholder,
}: {
  rows: Rows<T>;
  ids: string[];
  titleOf: (contact: T) => string;
  count: (count: number) => string;
  placeholder?: string;
}) => {
  const { byId, loading } = useContactsById(rows, ids);
  const contacts = ids.flatMap((id) => byId.get(id) ?? []);
  const first = contacts[0];
  const title = contacts.length > 1 ? count(contacts.length) : first && titleOf(first);

  return (
    <span className="inline-flex items-center gap-2 overflow-hidden">
      <span className="flex -space-x-1.5">
        {contacts.slice(0, 3).map((contact) => (
          <Avatar key={contact.id} size="lg" className="ring-2 ring-background">
            <Avatar.Image src={readImage(contact.avatarUrl)} />
            <Avatar.Fallback>{titleOf(contact).charAt(0)}</Avatar.Fallback>
          </Avatar>
        ))}
      </span>
      <Combobox.Value value={title} loading={loading} placeholder={placeholder} />
    </span>
  );
};

/**
 * Customers by id: their avatars, and the name.
 * With several, it says how many.
 */
export const CustomersInline = ({
  customerIds = [],
  contacts,
  placeholder,
}: ContactSource & { customerIds?: string[]; placeholder?: string }) => {
  const { t } = useTranslation('ui', { keyPrefix: 'customer' });

  return (
    <ContactsInline
      rows={contacts.customers}
      ids={customerIds}
      titleOf={customerTitle}
      count={(count) => t('selected', '{{count}} customers', { count })}
      placeholder={placeholder}
    />
  );
};

/**
 * Companies by id: their avatars, and the name.
 * With several, it says how many.
 */
export const CompaniesInline = ({
  companyIds = [],
  contacts,
  placeholder,
}: ContactSource & { companyIds?: string[]; placeholder?: string }) => {
  const { t } = useTranslation('ui', { keyPrefix: 'company' });

  return (
    <ContactsInline
      rows={contacts.companies}
      ids={companyIds}
      titleOf={companyTitle}
      count={(count) => t('selected', '{{count}} companies', { count })}
      placeholder={placeholder}
    />
  );
};
