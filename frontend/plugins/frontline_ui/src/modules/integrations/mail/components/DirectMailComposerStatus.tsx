import { Button } from 'erxes-ui';
import type {
  MailAttachmentInput,
  MailDeliveryOutcome,
} from '@/integrations/mail/types/mailDelivery';

export type ComposerAttachment = MailAttachmentInput & { id: string };

export const ComposerAttachments = ({
  attachments,
  disabled,
  onRemove,
}: {
  attachments: ComposerAttachment[];
  disabled: boolean;
  onRemove: (id: string) => void;
}) => {
  if (!attachments.length) return null;

  return (
    <ul className="flex flex-none flex-wrap gap-2 px-4 py-2 text-sm">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="flex items-center gap-1 rounded bg-[#f2f6fc] px-2"
        >
          <span className="max-w-48 truncate">{attachment.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove ${attachment.name}`}
            disabled={disabled}
            onClick={() => onRemove(attachment.id)}
          >
            ×
          </Button>
        </li>
      ))}
    </ul>
  );
};

export const ComposerStatus = ({
  failedDelivery,
  validRecipients,
  checkingRecipients,
  recipientsVerified,
  recipientVerificationError,
  onRetryVerification,
}: {
  failedDelivery?: MailDeliveryOutcome;
  validRecipients: boolean;
  checkingRecipients: boolean;
  recipientsVerified: boolean;
  recipientVerificationError: boolean;
  onRetryVerification: () => void;
}) => (
  <>
    {failedDelivery && (
      <p role="alert" className="px-4 py-3 text-sm text-destructive">
        {failedDelivery.deliveryError || 'Email was not delivered.'}
        {' Retry sending, or close this draft to start a new email.'}
      </p>
    )}
    {validRecipients && !checkingRecipients && !recipientsVerified && (
      <output className="block px-4 py-3 text-sm text-destructive">
        {recipientVerificationError
          ? 'Unable to check recipient email verification.'
          : 'All recipient email addresses must be verified before sending.'}
        {recipientVerificationError && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRetryVerification}
          >
            Retry
          </Button>
        )}
      </output>
    )}
  </>
);
