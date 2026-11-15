import { IconArrowUpRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '../../components/avatar';
import { Skeleton } from '../../components/skeleton';
import { cn } from '../../lib/utils';
import { readImage } from '../../utils/core';
import {
  companyTitle,
  type ContactQueries,
  customerTitle,
  type TContactContentType,
} from './contacts';
import { useOpenRecord } from './openRecord';

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

const CHIP =
  'group/chip inline-flex h-6 max-w-full items-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium';

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
  const { open, canOpen } = useOpenRecord();
  const contact = useContact(contentType, contentId, contacts);

  if (contact.isPending) return <Skeleton radius="sm" className="h-5 w-20" />;

  // A record that can't be read says why, and still opens to show it.
  const name =
    contact.error?.message ||
    contact.title ||
    placeholder ||
    (contentType === 'core:customer' ? 'Unnamed customer' : 'Unnamed company');

  const face = (
    <>
      <Avatar size="sm" className="size-4 flex-none">
        <Avatar.Image src={readImage(contact.avatarUrl ?? undefined)} />
        <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
      </Avatar>
      <span className={cn('truncate', contact.error && 'text-destructive')}>{name}</span>
    </>
  );

  if (!canOpen) {
    return (
      <span title={name} className={CHIP}>
        {face}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open({ contentType, contentId })}
      title={name}
      data-panel-inline=""
      className={cn(
        CHIP,
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {face}
      {/* It opens the record: say so on hover. */}
      <IconArrowUpRight
        className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
};
