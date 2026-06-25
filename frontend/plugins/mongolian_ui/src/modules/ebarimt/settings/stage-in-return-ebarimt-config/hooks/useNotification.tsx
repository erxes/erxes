import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useNotification = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const showSuccess = (message: string) => {
    toast({
      title: t('success'),
      description: message,
      variant: 'default',
    });
  };

  const showError = (message: string) => {
    toast({
      title: t('error'),
      description: message,
      variant: 'destructive',
    });
  };

  const showConfigCreated = () => {
    showSuccess(t('ebarimt-return-config-created-successfully'));
  };

  const showConfigUpdated = () => {
    showSuccess(t('ebarimt-return-config-updated-successfully'));
  };

  const showConfigDeleted = () => {
    showSuccess(t('ebarimt-return-config-deleted-successfully'));
  };

  return {
    showSuccess,
    showError,
    showConfigCreated,
    showConfigUpdated,
    showConfigDeleted,
  };
};
