import { useQuery } from '@apollo/client';
import {
  IconAlertTriangle,
  IconCar,
  IconCash,
  IconCircleCheck,
  IconHash,
  IconKey,
  IconMapPin,
  IconPhoto,
  IconReceipt,
  IconRefresh,
  IconTruckDelivery,
  IconUser,
  IconWallet,
  IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Alert,
  Badge,
  Button,
  CopyText,
  ScrollArea,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';
import { PosPanelText } from '~/widgets/record-panel/PosPanelShared';
import { SALES_POS_ORDER_PAPA_PHOTO_PROOF } from '../graphql/papaDocuments';
import { usePapaDelivery } from '../hooks/usePapaDelivery';
import {
  orderDeliveryDefaults,
  PAPA_CANCELLABLE_STATUSES,
  PAPA_RESENDABLE_STATUSES,
  papaPhotoProofSchema,
  TPapaDelivery,
} from '../utils/papaJson';
import { PapaDeliveryQuoteForm } from './PapaDeliveryQuoteForm';
import { PapaDeliverySendForm } from './PapaDeliverySendForm';
import { PapaWalletBalance } from './PapaWalletBalance';

const formatAmount = (value: unknown) =>
  value != null && value !== '' ? `${Number(value).toLocaleString()}₮` : '-';

const personName = (delivery: TPapaDelivery) =>
  [delivery.driver?.lastname, delivery.driver?.firstname]
    .filter(Boolean)
    .join(' ') || '-';

const PapaPhotoProof = ({
  orderId,
  busy,
  onApprove,
}: {
  orderId: string;
  busy: boolean;
  onApprove: () => void;
}) => {
  const { t } = useTranslation('sales');
  const { data, loading, error } = useQuery(SALES_POS_ORDER_PAPA_PHOTO_PROOF, {
    variables: { id: orderId },
    fetchPolicy: 'network-only',
  });
  const proof = papaPhotoProofSchema.safeParse(data?.posOrderPapaPhotoProof);

  if (loading) {
    return <Spinner />;
  }

  if (error || !proof.success) {
    return (
      <p className="text-xs text-muted-foreground">
        {error?.message || t('papa-no-photo', 'No delivery photo yet')}
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      {proof.data.image && (
        <a href={proof.data.image} target="_blank" rel="noreferrer">
          <img
            src={proof.data.image}
            alt={t('papa-delivery-photo', 'Delivery photo')}
            className="max-h-64 w-full rounded object-contain"
          />
        </a>
      )}
      <p className="text-xs text-muted-foreground">
        {[proof.data.other_receive_name, proof.data.other_receive_phone]
          .filter(Boolean)
          .join(' · ')}
        {proof.data.description ? ` — ${proof.data.description}` : ''}
      </p>
      <Button size="sm" className="w-full" disabled={busy} onClick={onApprove}>
        {t('papa-approve-photo', 'Approve photo and finish delivery')}
      </Button>
    </div>
  );
};

/** The order panel's Delivery tab: quote, send and track a Papa delivery. */
export const PapaDeliveryPanel = ({ orderId }: { orderId: string }) => {
  const { t } = useTranslation('sales');
  const { confirm } = useConfirm();
  const papa = usePapaDelivery(orderId);
  const { order, delivery, busy } = papa;
  const defaults = useMemo(
    () => orderDeliveryDefaults(order?.deliveryInfo),
    [order?.deliveryInfo],
  );

  if (papa.loading && !order) {
    return (
      <div className="flex justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (papa.error) {
    return (
      <Alert variant="destructive" className="m-4">
        <IconAlertTriangle />
        <Alert.Description>{papa.error.message}</Alert.Description>
      </Alert>
    );
  }

  if (!order) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        {t('order-not-found')}
      </p>
    );
  }

  if (order.type !== 'delivery') {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        {t(
          'papa-not-delivery-order',
          'Only delivery orders can be sent to Papa.',
        )}
      </p>
    );
  }

  const status = delivery?.status;
  const canQuote = !delivery || PAPA_RESENDABLE_STATUSES.includes(status ?? '');
  // A failed send that reached Papa (or may have) is retried, never re-quoted.
  const failedWithOrder =
    status === 'FAILED' &&
    (!!delivery?.papaOrderId || !!delivery?.createUncertain);
  const canSend = status === 'QUOTED' || failedWithOrder;
  const canCancel =
    !!delivery?.papaOrderId &&
    (status === 'FAILED' || PAPA_CANCELLABLE_STATUSES.includes(status ?? ''));

  const canMarkDelivered = status === 'START' && !!delivery?.cargoId;
  // Papa takes its fee from DTS's wallet when a delivery ends; an END
  // delivery still unpaid means the wallet was short at that moment.
  const showFee = status === 'END' || status === 'COMPLETED';
  const feeUnpaid = status === 'END' && !delivery?.isPaid;

  const onPayFromWallet = () =>
    confirm({
      message: t(
        'papa-fee-wallet-confirm',
        'Pay Papa’s delivery fee for this order from your Papa wallet now?',
      ),
    }).then(() => papa.payFee('wallet'));

  const onPaidOutside = () =>
    confirm({
      message: t(
        'papa-fee-outside-confirm',
        'Record Papa’s delivery fee for this order as already paid outside Papa (cash or bank transfer)? Papa will mark the order paid without taking money from the wallet.',
      ),
    }).then(() => papa.payFee('outside'));

  const onMarkDelivered = () =>
    confirm({
      message: t(
        'papa-mark-delivered-confirm',
        'Mark this delivery as delivered without the receiver’s code or a photo?',
      ),
    }).then(() => papa.markDelivered());

  const onCancel = () =>
    confirm({
      message: t(
        'papa-cancel-confirm',
        'Cancel this delivery with Papa? A driver who already accepted it will be released.',
      ),
    }).then(() => papa.cancel());

  // The record panel gives the tab a fixed height; scroll inside it like the
  // Detail and Payments tabs do.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-4 p-4">
        {delivery && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <IconTruckDelivery className="size-4 text-muted-foreground" />
                <Badge variant="secondary">
                  {t(
                    `papa-status-${delivery.status.toLowerCase()}`,
                    delivery.status,
                  )}
                </Badge>
                {delivery.code && (
                  <CopyText
                    value={delivery.code}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {delivery.code}
                  </CopyText>
                )}
              </div>
              {delivery.papaOrderId && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => papa.refresh()}
                >
                  <IconRefresh />
                  {t('refresh', 'Refresh')}
                </Button>
              )}
            </div>

            {delivery.error && (
              <Alert variant="destructive">
                <IconAlertTriangle />
                <Alert.Description>{delivery.error}</Alert.Description>
              </Alert>
            )}

            {papa.deal?.error && (
              <Alert variant="warning">
                <IconAlertTriangle />
                <Alert.Description>
                  {t(
                    'papa-deal-not-moved',
                    'The delivery deal was not moved: {{error}}',
                    { error: papa.deal.error },
                  )}
                </Alert.Description>
              </Alert>
            )}

            <PanelField
              icon={IconCash}
              label={t('papa-price', 'Delivery price')}
              cell={false}
            >
              <PosPanelText>
                {formatAmount(delivery.price)}
                {delivery.distance ? ` · ${delivery.distance} km` : ''}
                {delivery.duration ? ` · ${delivery.duration} min` : ''}
              </PosPanelText>
            </PanelField>
            {showFee && (
              <PanelField
                icon={IconReceipt}
                label={t('papa-fee-status', 'Papa fee')}
                cell={false}
              >
                <PosPanelText>
                  {feeUnpaid
                    ? `${t('papa-fee-unpaid', 'Unpaid')} · ${formatAmount(
                        delivery.unpaidAmount ?? delivery.price,
                      )}`
                    : t('papa-fee-paid', 'Paid')}
                </PosPanelText>
              </PanelField>
            )}
            <PanelField icon={IconMapPin} label={t('address')} cell={false}>
              <PosPanelText>{delivery.toAddress || '-'}</PosPanelText>
            </PanelField>
            {delivery.pincode && (
              <PanelField
                icon={IconKey}
                label={t('papa-start-code', 'Pickup code (give to driver)')}
                cell={false}
              >
                <CopyText
                  value={delivery.pincode}
                  className="px-2 font-mono text-sm"
                >
                  {delivery.pincode}
                </CopyText>
              </PanelField>
            )}
            {delivery.papaOrderId && (
              <PanelField
                icon={IconHash}
                label={t('papa-order-id', 'Papa order id')}
                cell={false}
              >
                <CopyText
                  value={delivery.papaOrderId}
                  className="px-2 font-mono text-xs break-all"
                >
                  {delivery.papaOrderId}
                </CopyText>
              </PanelField>
            )}
            {delivery.shippingId && (
              <PanelField
                icon={IconHash}
                label={t('papa-shipping-id', 'Papa shipping id')}
                cell={false}
              >
                <CopyText
                  value={delivery.shippingId}
                  className="px-2 font-mono text-xs break-all"
                >
                  {delivery.shippingId}
                </CopyText>
              </PanelField>
            )}
            {delivery.endPincode && (
              <PanelField
                icon={IconHash}
                label={t('papa-end-code', 'Delivery code (for receiver)')}
                cell={false}
              >
                <CopyText
                  value={delivery.endPincode}
                  className="px-2 font-mono text-sm"
                >
                  {delivery.endPincode}
                </CopyText>
              </PanelField>
            )}
            {delivery.driver && (
              <PanelField
                icon={IconUser}
                label={t('papa-driver', 'Driver')}
                cell={false}
              >
                <PosPanelText>
                  {personName(delivery)}
                  {delivery.driver.phone ? ` · ${delivery.driver.phone}` : ''}
                </PosPanelText>
              </PanelField>
            )}
            {delivery.car && (
              <PanelField
                icon={IconCar}
                label={t('papa-vehicle', 'Vehicle')}
                cell={false}
              >
                <PosPanelText>
                  {[
                    delivery.car.type,
                    delivery.car.plate,
                    delivery.car.capacity,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '-'}
                </PosPanelText>
              </PanelField>
            )}
            {delivery.updatedAt && (
              <p className="px-2 text-xs text-muted-foreground">
                {t('papa-updated', 'Updated')}{' '}
                {dayjs(delivery.updatedAt).format('YYYY-MM-DD HH:mm')}
              </p>
            )}
          </div>
        )}

        {delivery?.hasPhotoProof && delivery.status !== 'END' && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <IconPhoto className="size-4" />
              {t('papa-photo-proof', 'Driver’s delivery photo')}
            </h4>
            <PapaPhotoProof
              orderId={orderId}
              busy={busy}
              onApprove={() => papa.approvePhoto()}
            />
          </section>
        )}

        {canSend && (
          <section className="space-y-2">
            <h4 className="text-sm font-medium">
              {t('papa-step-send', 'Send to Papa')}
            </h4>
            <PapaWalletBalance amount={delivery?.price} />
            <PapaDeliverySendForm
              defaults={defaults}
              busy={busy}
              retry={status === 'FAILED'}
              onSubmit={(values) =>
                papa.send({
                  receiverPhone: values.receiverPhone,
                  description: values.description || undefined,
                  receiverPays: values.receiverPays,
                })
              }
            />
          </section>
        )}

        {canQuote && !failedWithOrder && (
          <section className="space-y-2">
            <h4 className="text-sm font-medium">
              {delivery
                ? t('papa-step-requote', 'Change address and get a new price')
                : t('papa-step-quote', 'Delivery address')}
            </h4>
            <PapaDeliveryQuoteForm
              key={delivery?.quoteId || 'new'}
              defaults={defaults}
              previous={delivery}
              busy={busy}
              onSubmit={(values) => papa.quote(values)}
            />
          </section>
        )}

        {feeUnpaid && (
          <section className="space-y-2">
            <h4 className="text-sm font-medium">
              {t('papa-fee-unpaid-title', 'Papa fee is unpaid')}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t(
                'papa-fee-unpaid-help',
                'Papa could not take the delivery fee from your Papa wallet when this delivery ended. Top up the wallet in the Papa Business app or business.papa.mn, then pay it here.',
              )}
            </p>
            <PapaWalletBalance
              amount={delivery?.unpaidAmount ?? delivery?.price}
            />
            <Button
              disabled={busy}
              onClick={onPayFromWallet}
              className="w-full"
            >
              <IconWallet />
              {t('papa-fee-pay-wallet', 'Pay Papa fee from wallet')}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={onPaidOutside}
              className="w-full"
            >
              <IconCash />
              {t(
                'papa-fee-paid-outside-action',
                'Paid outside Papa (cash or transfer)',
              )}
            </Button>
          </section>
        )}

        {canMarkDelivered && (
          <Button disabled={busy} onClick={onMarkDelivered}>
            <IconCircleCheck />
            {t('papa-mark-delivered', 'Mark as delivered')}
          </Button>
        )}

        {canCancel && (
          <Button variant="outline" disabled={busy} onClick={onCancel}>
            <IconX />
            {t('papa-cancel', 'Cancel delivery')}
          </Button>
        )}
      </div>
    </ScrollArea>
  );
};
