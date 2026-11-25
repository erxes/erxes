import {
  IconAlertTriangle,
  IconCalendarCheck,
  IconCircleX,
  IconUser,
  IconUserCheck,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Alert } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';
import { PosPanelText } from '~/widgets/record-panel/PosPanelShared';
import {
  IOrderDeliveryDefaults,
  orderDeliveryDefaults,
  PAPA_AUTO_SEND_MISSING,
  PAPA_CLOSE_REASONS,
  parsePapaAutoSend,
  TPapaDelivery,
} from '../utils/papaJson';

interface IPapaOrderCustomer {
  firstName?: string | null;
  lastName?: string | null;
  primaryPhone?: string | null;
}

const formatTime = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '';

const joinParts = (parts: (string | null | undefined)[]) =>
  parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' · ');

const customerName = (customer?: IPapaOrderCustomer | null) =>
  joinParts([customer?.lastName, customer?.firstName]);

/**
 * The Delivery tab's defaults: the checkout's address, pin and receiver,
 * falling back to the order's customer for the receiver's name and phone.
 */
export const useOrderDeliveryDefaults = (
  deliveryInfo: unknown,
  customer?: IPapaOrderCustomer | null,
): IOrderDeliveryDefaults => {
  const name = customerName(customer);
  const phone = customer?.primaryPhone ?? '';

  return useMemo(() => {
    const info = orderDeliveryDefaults(deliveryInfo);

    return {
      ...info,
      receiverName: info.receiverName || name,
      phone: info.phone || phone,
    };
  }, [deliveryInfo, name, phone]);
};

/** The order's customer, when it has one. */
export const PapaCustomerField = ({
  customer,
}: {
  customer?: IPapaOrderCustomer | null;
}) => {
  const { t } = useTranslation('sales');
  const text = joinParts([customerName(customer), customer?.primaryPhone]);

  if (!text) {
    return null;
  }

  return (
    <PanelField icon={IconUser} label={t('customer', 'Customer')} cell={false}>
      <PosPanelText>{text}</PosPanelText>
    </PanelField>
  );
};

/** Why an automatic send did not reach Papa, until staff send it. */
export const PapaAutoSendNotice = ({
  value,
  hasPapaOrder,
}: {
  value: unknown;
  hasPapaOrder: boolean;
}) => {
  const { t } = useTranslation('sales');
  const autoSend = useMemo(() => parsePapaAutoSend(value), [value]);

  if (!autoSend || hasPapaOrder || autoSend.status === 'sent') {
    return null;
  }

  const missing = (autoSend.missing ?? [])
    .map((key) => {
      const reason = PAPA_AUTO_SEND_MISSING[key];
      return reason ? t(reason[0], reason[1]) : key;
    })
    .join(', ');

  const messages = {
    skipped: t(
      'papa-auto-skipped',
      'Not sent to Papa automatically: the order is missing {{missing}}. Fill it in below and send it.',
      { missing },
    ),
    failed: t(
      'papa-auto-failed',
      'Sending to Papa automatically failed: {{error}}. Finish it below.',
      { error: autoSend.error || '' },
    ),
    sending: t(
      'papa-auto-sending',
      'Sending to Papa automatically… Refresh in a moment.',
    ),
  };

  return (
    <Alert variant={autoSend.status === 'sending' ? 'default' : 'warning'}>
      <IconAlertTriangle />
      <Alert.Description>{messages[autoSend.status]}</Alert.Description>
    </Alert>
  );
};

/** Who receives it, when it was delivered, or why it was not. */
export const PapaDeliveryOutcome = ({
  delivery,
}: {
  delivery: TPapaDelivery;
}) => {
  const { t } = useTranslation('sales');
  const receiver = joinParts([delivery.receiverName, delivery.receiverPhone]);
  const closeReason = PAPA_CLOSE_REASONS[delivery.status];

  return (
    <>
      {receiver && (
        <PanelField
          icon={IconUserCheck}
          label={t('papa-receiver', 'Receiver')}
          cell={false}
        >
          <PosPanelText>{receiver}</PosPanelText>
        </PanelField>
      )}
      {delivery.deliveredAt && (
        <PanelField
          icon={IconCalendarCheck}
          label={t('papa-delivered-at', 'Delivered at')}
          cell={false}
        >
          <PosPanelText>{formatTime(delivery.deliveredAt)}</PosPanelText>
        </PanelField>
      )}
      {closeReason && (
        <PanelField
          icon={IconCircleX}
          label={t('papa-closed-reason', 'Not delivered')}
          cell={false}
        >
          <PosPanelText>
            {joinParts([
              t(closeReason[0], closeReason[1]),
              delivery.cancelReason,
              formatTime(delivery.closedAt),
            ])}
          </PosPanelText>
        </PanelField>
      )}
    </>
  );
};
