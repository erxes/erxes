import React from 'react';
import { Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useMailMessageRetry } from '@/integrations/mail/hooks/useMailConversationDetail';
import type { MailDeliveryStatus } from '@/integrations/mail/types/mailDelivery';
import type { MailData } from '@/integrations/mail/types/mailThread';

const DELIVERY_LABEL_KEYS: Partial<Record<MailDeliveryStatus, string>> = {
  pending: 'email-delivery-pending',
  bounced: 'email-delivery-bounced',
};

export const DeliveryBadge: React.FC<{ status: MailDeliveryStatus }> = ({
  status,
}) => {
  const { t } = useTranslation('frontline');

  const label = t(DELIVERY_LABEL_KEYS[status] ?? 'email-delivery-failed');

  return (
    <span
      className={cn(
        'flex-none rounded-full px-2 py-px text-[10px] font-medium',
        status === 'pending'
          ? 'bg-muted text-[#5f6368] dark:text-[#9aa0a6]'
          : 'bg-destructive/10 text-destructive',
      )}
    >
      {label}
    </span>
  );
};

export const DeliveryNotice: React.FC<{
  messageId: string;
  mailData: MailData;
}> = ({ messageId, mailData }) => {
  const { t } = useTranslation('frontline');
  const { mailMessageRetry, loading } = useMailMessageRetry();
  const { deliveryStatus } = mailData;

  if (deliveryStatus !== 'failed' && deliveryStatus !== 'bounced') {
    return null;
  }

  const bounced = deliveryStatus === 'bounced';

  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px]">
      <IconAlertTriangle
        size={14}
        className="mt-0.5 flex-none text-destructive"
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium text-destructive">
          {bounced ? t('email-delivery-bounced') : t('email-delivery-failed')}
        </p>
        <p className="break-words text-[#5f6368] dark:text-[#9aa0a6]">
          {bounced
            ? t('email-bounced-for', {
                recipients: (mailData.bouncedRecipients ?? []).join(', '),
              })
            : mailData.deliveryError}
        </p>
        {!bounced && (
          <p className="text-[#5f6368] dark:text-[#9aa0a6]">
            {mailData.deliveryRetryable
              ? t('email-delivery-retry-hint')
              : t('email-delivery-permanent-hint')}
          </p>
        )}
      </div>
      {!bounced && (
        <button
          type="button"
          className="flex flex-none items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          onClick={() => mailMessageRetry(messageId)}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : <IconRefresh size={13} />}
          {t('email-delivery-retry')}
        </button>
      )}
    </div>
  );
};

export const SenderNotice: React.FC<{ mailData: MailData }> = ({
  mailData,
}) => {
  const { t } = useTranslation('frontline');

  if (!mailData.senderMismatch) {
    return null;
  }

  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-[12px]">
      <IconAlertTriangle size={14} className="mt-0.5 flex-none text-warning" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium text-warning">
          {t('email-sender-unverified')}
        </p>
        <p className="break-words text-[#5f6368] dark:text-[#9aa0a6]">
          {t('email-sender-mismatch', { address: mailData.envelopeFrom })}
        </p>
      </div>
    </div>
  );
};
