import { Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IConversation } from '@/inbox/types/Conversation';

export const ConversationIdleIndicator = ({
  customer,
}: {
  customer?: IConversation['customer'];
}) => {
  const { t } = useTranslation('frontline');
  const lastSeen = customer?.lastSeenAt ? new Date(customer.lastSeenAt) : null;
  if (
    customer?.isOnline !== false ||
    !lastSeen ||
    Number.isNaN(lastSeen.getTime())
  )
    return null;
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <span
          tabIndex={0}
          aria-label={t('customer-idle', 'Idle')}
          onClick={(event) => event.stopPropagation()}
          className="absolute -bottom-0.5 -right-0.5 z-10 flex size-4 origin-bottom-right items-end justify-end transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none motion-reduce:transition-none"
        >
          <span className="size-0 border-b-[12px] border-l-[12px] border-b-orange-500 border-l-transparent drop-shadow-sm" />
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <span className="font-medium">{t('customer-idle', 'Idle')}</span>
        <span className="ml-1.5">
          {t('last-seen', 'Last seen')}: {lastSeen.toLocaleString()}
        </span>
      </Tooltip.Content>
    </Tooltip>
  );
};
