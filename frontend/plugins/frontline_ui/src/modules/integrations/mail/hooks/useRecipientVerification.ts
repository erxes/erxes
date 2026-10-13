import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { z } from 'zod';
import { useDebounce } from 'use-debounce';
import { MAIL_UNVERIFIED_RECIPIENTS_QUERY } from '@/integrations/mail/graphql/queries/mailRecipients';
import { splitAddresses } from '@/integrations/mail/utils/directMailComposer';

export const useRecipientVerification = ({
  to,
  cc,
  bcc,
  showCc,
  showBcc,
  active,
}: {
  to: string;
  cc: string;
  bcc: string;
  showCc: boolean;
  showBcc: boolean;
  active: boolean;
}): {
  validRecipients: boolean;
  recipientsVerified: boolean;
  checkingRecipients: boolean;
  recipientVerificationError: boolean;
  recheckRecipients: () => void;
} => {
  const recipientEmails = useMemo(
    () =>
      [
        ...new Set(
          [
            ...splitAddresses(to),
            ...(showCc ? splitAddresses(cc) : []),
            ...(showBcc ? splitAddresses(bcc) : []),
          ]
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean),
        ),
      ].sort((left, right) => left.localeCompare(right)),
    [to, cc, bcc, showCc, showBcc],
  );
  const validRecipients =
    recipientEmails.length > 0 &&
    recipientEmails.every(
      (email) => z.string().email().safeParse(email).success,
    );
  const recipientKey = recipientEmails.join(',');
  const [debouncedRecipientKey] = useDebounce(recipientKey, 300);
  const waitingForRecipients = recipientKey !== debouncedRecipientKey;
  const {
    data,
    loading: checkingRecipients,
    error,
    refetch,
  } = useQuery<{ mailUnverifiedRecipients: string[] }>(
    MAIL_UNVERIFIED_RECIPIENTS_QUERY,
    {
      variables: {
        emails: debouncedRecipientKey ? debouncedRecipientKey.split(',') : [],
      },
      skip: !active || !validRecipients || waitingForRecipients,
      fetchPolicy: 'network-only',
    },
  );

  return {
    validRecipients,
    checkingRecipients: checkingRecipients || waitingForRecipients,
    recipientVerificationError: Boolean(error),
    recipientsVerified:
      validRecipients &&
      !waitingForRecipients &&
      !checkingRecipients &&
      !error &&
      data?.mailUnverifiedRecipients.length === 0,
    recheckRecipients: () => {
      refetch().catch(() => undefined);
    },
  };
};
