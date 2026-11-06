import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_EMAIL_BRAND_UPDATE } from '../graphql/notificationTemplateMutations';
import { NOTIFICATION_EMAIL_BRAND } from '../graphql/notificationTemplateQueries';
import { TNotificationEmailBrand } from '../types';

export const useNotificationEmailBrand = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { toast } = useToast();

  const { data, loading } = useQuery<{
    notificationEmailBrand: TNotificationEmailBrand;
  }>(NOTIFICATION_EMAIL_BRAND);

  const [updateMutation, { loading: saving }] = useMutation<{
    notificationEmailBrandUpdate: TNotificationEmailBrand;
  }>(NOTIFICATION_EMAIL_BRAND_UPDATE, {
    refetchQueries: [{ query: NOTIFICATION_EMAIL_BRAND }],
    onError: (error) =>
      toast({
        title: t('brand-not-saved'),
        description: error.message,
        variant: 'destructive',
      }),
  });

  const updateBrand = async (input: TNotificationEmailBrand) => {
    const { data: result } = await updateMutation({ variables: { input } });

    if (result) {
      toast({ variant: 'success', title: t('brand-saved') });
    }

    return result?.notificationEmailBrandUpdate;
  };

  return {
    brand: data?.notificationEmailBrand,
    loading,
    saving,
    updateBrand,
  };
};
