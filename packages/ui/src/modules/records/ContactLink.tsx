import { useQuery } from '@tanstack/react-query';
import {
  companyTitle,
  type ContactQueries,
  customerTitle,
  type TContactContentType,
} from './contacts';
import { RecordChip } from './RecordChip';

/** The customer's or company's title and avatar. */
const useContact = (
  contentType: TContactContentType,
  contentId: string,
  contacts: ContactQueries,
) => {
  const isCustomer = contentType === 'core:customer';
  const customer = useQuery({ ...contacts.customer(contentId), enabled: isCustomer });
  const company = useQuery({ ...contacts.company(contentId), enabled: !isCustomer });

  if (isCustomer) {
    return {
      title: customer.data ? customerTitle(customer.data) : '',
      avatarUrl: customer.data?.avatarUrl,
      isPending: customer.isPending,
      error: customer.error,
    };
  }

  return {
    title: company.data ? companyTitle(company.data) : '',
    avatarUrl: company.data?.avatarUrl,
    isPending: company.isPending,
    error: company.error,
  };
};

/**
 * A customer or company as a chip: its avatar and name. Inside erxes, clicking it opens the
 * record in core's side panel beside the page; elsewhere it is only the name.
 * `contacts` is `contactQueries` from `@erxes/core-contract/client`.
 */
export const ContactLink = ({
  contentType,
  contentId,
  contacts,
  placeholder,
}: {
  contentType: TContactContentType;
  contentId: string;
  contacts: ContactQueries;
  /** Shown when the record has no name, email or phone. */
  placeholder?: string;
}) => {
  const contact = useContact(contentType, contentId, contacts);

  const name =
    contact.error?.message ||
    contact.title ||
    placeholder ||
    (contentType === 'core:customer' ? 'Unnamed customer' : 'Unnamed company');

  return (
    <RecordChip
      record={{ contentType, contentId }}
      name={name}
      avatarUrl={contact.avatarUrl}
      loading={contact.isPending}
      failed={Boolean(contact.error)}
    />
  );
};
