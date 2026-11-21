import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Button, Spinner } from 'erxes-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { AuthShell, BackToSignIn, ErrorLine } from './components/AuthParts';

/**
 * The link emailed to a Reply-To address. It confirms on a click, not on
 * opening: mail scanners open links, and must not confirm for the owner.
 */
export const ConfirmReplyToPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [token] = useQueryState('token', parseAsString.withDefault(''));
  const confirm = useMutation(orpc.emails.confirmReplyTo.mutationOptions());

  if (confirm.isSuccess) {
    const { email, organization } = confirm.data;

    return (
      <AuthShell
        title={t('reply-to-done', 'Address confirmed')}
        subtitle={t(
          'reply-to-done-description',
          'Replies to {{organization}}’s emails can now come to {{email}}.',
          { organization, email },
        )}
      >
        <BackToSignIn />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('reply-to-title', 'Confirm this address')}
      subtitle={t(
        'reply-to-subtitle',
        'An organisation on erxes asked for replies to its emails to come to this address.',
      )}
    >
      <ErrorLine error={confirm.error} />
      <Button
        className="h-8"
        disabled={confirm.isPending}
        onClick={() => confirm.mutate({ token })}
      >
        {confirm.isPending && <Spinner size="sm" />}
        {t('reply-to-confirm', 'Confirm the address')}
      </Button>
      <BackToSignIn />
    </AuthShell>
  );
};
