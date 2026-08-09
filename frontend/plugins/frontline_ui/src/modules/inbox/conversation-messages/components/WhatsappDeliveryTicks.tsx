import { IconCheck, IconChecks, IconClock, IconExclamationCircle } from '@tabler/icons-react';
import { Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IMessage } from '@/inbox/types/Conversation';

/**
 * Renders the sent/delivered/read/failed state Meta reports for an outbound
 * WhatsApp message, matching the tick convention WhatsApp itself uses so an
 * agent already familiar with the product reads it at a glance.
 *
 * Nothing renders for `null` — see the field's own doc comment on `IMessage`:
 * this is either a non-WhatsApp message, or a WhatsApp message sent moments
 * ago that has not yet had a status webhook applied. Rendering a placeholder
 * tick for that gap would claim a state Meta has not actually reported yet.
 */
export const WhatsappDeliveryTicks = ({
  whatsappDelivery,
}: {
  whatsappDelivery: IMessage['whatsappDelivery'];
}) => {
  const { t } = useTranslation('frontline');

  if (!whatsappDelivery?.status) {
    return null;
  }

  const { status, error } = whatsappDelivery;

  if (status === 'failed') {
    return (
      <Tooltip.Provider delayDuration={100}>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <span className="inline-flex text-destructive">
              <IconExclamationCircle className="size-3.5" />
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {error || t('whatsapp-delivery-failed')}
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  // `sent` is a real Meta state (accepted by Meta, not yet confirmed
  // delivered) and is told apart from the "not yet reported at all" case
  // above, which renders nothing rather than a clock — a message can be
  // sitting in the outbox for a moment before Meta's first webhook arrives,
  // and a clock there would look identical to `sent` and mean something else.
  const icon =
    status === 'sent' ? (
      <IconClock className="size-3.5" />
    ) : status === 'delivered' ? (
      <IconChecks className="size-3.5" />
    ) : status === 'read' || status === 'played' ? (
      <IconChecks className="size-3.5 text-primary" />
    ) : (
      <IconCheck className="size-3.5" />
    );

  const label = t(`whatsapp-delivery-${status}`, { defaultValue: status });

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="inline-flex text-muted-foreground">{icon}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
