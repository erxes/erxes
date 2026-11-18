import { contactSearchQueries, messageOf } from '@erxes/core-contract/client';
import {
  Combobox,
  companyTitle,
  customerTitle,
  Popover,
  SelectContactContent,
  type TContactKind,
} from 'erxes-ui';
import { useState } from 'react';
import { useCompany } from '../companies/useCompanies';
import { useCustomer } from '../customers/useCustomers';

/*
 * A customer or company picker on a button. The searchable list is erxes-ui's
 * `SelectContactContent`; a linked one is erxes-ui's `ContactLink`, the chip plugins show too.
 */

/** A linked customer's or company's title. */
const useContactRecord = (kind: TContactKind, id: string) => {
  const customer = useCustomer(kind === 'customer' ? id : null);
  const company = useCompany(kind === 'company' ? id : null);

  if (kind === 'customer') {
    return {
      title: customer.data && customerTitle(customer.data),
      isPending: customer.isPending,
      error: customer.error,
    };
  }

  return {
    title: company.data && companyTitle(company.data),
    isPending: company.isPending,
    error: company.error,
  };
};

/** A customer's or company's title, or why it could not be read. */
const ContactTitle = ({ kind, id }: { kind: TContactKind; id: string }) => {
  const record = useContactRecord(kind, id);

  if (record.error) {
    return <span className="truncate text-destructive-text">{messageOf(record.error)}</span>;
  }

  return <Combobox.Value value={record.title || id} loading={record.isPending} />;
};

/** One customer or company on a button; `noneLabel` shows while there is none and clears it. */
export const ContactSelect = ({
  kind,
  id,
  value,
  onValueChange,
  noneLabel,
}: {
  kind: TContactKind;
  id?: string;
  value: string | undefined;
  onValueChange: (id: string | undefined) => void;
  noneLabel: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger id={id} className="w-full">
        {value ? (
          <ContactTitle kind={kind} id={value} />
        ) : (
          <Combobox.Value placeholder={noneLabel} />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <SelectContactContent
          kind={kind}
          contacts={contactSearchQueries}
          multiple={false}
          noneLabel={noneLabel}
          value={value ? [value] : []}
          onValueChange={([next]) => {
            onValueChange(next);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};
