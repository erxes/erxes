import { Badge, Popover } from 'erxes-ui';
import { IconArrowRight, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useConversationContext } from '../hooks/useConversationContext';
import { useCustomersSharingEmail } from '../hooks/useCustomersSharingEmail';

// A widget visitor's typed email never joins an existing customer, so the
// same person can appear as several; staff decide whether to merge them.
export const ConversationSharedEmail = () => {
  const { t } = useTranslation('frontline');
  const { customer, customerId } = useConversationContext();
  const email = customer?.primaryEmail || customer?.emails?.[0];
  const { others } = useCustomersSharingEmail(
    email,
    customerId ?? undefined,
  );

  if (!email || !others.length) {
    return null;
  }

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button type="button" className="flex-none">
          <Badge variant="warning" className="gap-1 cursor-pointer">
            <IconUsers size={12} />
            {t('same-email-count', '+{{count}} same email', {
              count: others.length,
            })}
          </Badge>
        </button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-72 p-0">
        <div className="px-3 py-2 border-b text-xs text-muted-foreground whitespace-normal">
          {t(
            'same-email-description',
            '{{count}} other customers use {{email}}. They may be the same person.',
            { count: others.length, email },
          )}
        </div>
        <div className="flex flex-col py-1 max-h-60 overflow-y-auto">
          {others.map((other) => (
            <Link
              key={other._id}
              to={`/contacts/customers?contactId=${other._id}`}
              className="px-3 py-1.5 text-sm text-foreground hover:bg-accent truncate"
            >
              {other.name}
            </Link>
          ))}
        </div>
        <Link
          to={`/contacts/customers?searchValue=${encodeURIComponent(email)}`}
          className="flex items-center justify-between px-3 py-2 border-t text-sm font-medium text-primary hover:bg-accent"
        >
          {t('review-and-merge', 'Review and merge')}
          <IconArrowRight size={14} />
        </Link>
      </Popover.Content>
    </Popover>
  );
};
