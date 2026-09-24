import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const BroadcastCredentialsNotice = () => {
  const { t } = useTranslation('broadcasts');
  const { sameAsMailConfig, loading } = useSenderOptions();

  if (loading || !sameAsMailConfig) {
    return null;
  }

  return (
    <div className="col-span-2 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/6 p-3 text-sm leading-[140%] text-primary">
      <IconAlertTriangle className="size-4 shrink-0 translate-y-0.5" />
      <span>{t('settings.same-credentials')}</span>
    </div>
  );
};
