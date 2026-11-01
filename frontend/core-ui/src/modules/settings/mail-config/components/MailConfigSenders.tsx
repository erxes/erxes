import { useTranslation } from 'react-i18next';
import { MailConfigHeading } from '@/settings/mail-config/components/MailConfigHeading';
import { VerifiedSenders } from '@/settings/mail-config/components/VerifiedSenders';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';

export const MailConfigSenders = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'mail-config' });
  const { supportsSenderVerification, loading } = useSenderOptions();

  return (
    <>
      <MailConfigHeading
        title={t('verified-senders')}
        description={t('verified-senders-desc')}
      />
      {loading || supportsSenderVerification ? (
        <VerifiedSenders />
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('senders-not-supported')}
        </p>
      )}
    </>
  );
};
