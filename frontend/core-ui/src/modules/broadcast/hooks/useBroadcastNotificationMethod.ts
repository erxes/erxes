import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/** The notification form: the portal it goes to and its text with counters. */
export const useBroadcastNotificationMethod = () => {
  const { t } = useTranslation('broadcasts');
  const { control, watch } = useFormContext();
  const { clientPortals, loading } = useClientPortals();
  const portals = clientPortals || [];

  const portalLabelOf = (portalId?: string) =>
    portals.find((portal) => portal._id === portalId)?.name ||
    t('notification.portal-placeholder');

  const portalsStateOf = () => {
    if (loading) {
      return 'loading';
    }

    return portals.length ? 'ready' : 'empty';
  };

  return {
    control,
    portals,
    portalsState: portalsStateOf(),
    portalLabelOf,
    titleLength: (watch('notification.title') || '').length,
    contentLength: (watch('notification.content') || '').length,
    portalRules: { required: t('notification.portal-required') },
    titleRules: { required: t('notification.title-required') },
    contentRules: { required: t('notification.content-required') },
  };
};
