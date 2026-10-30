import { useQuery } from '@apollo/client';
import { NOTIFICATION_TEMPLATES } from '../graphql/notificationTemplateQueries';
import { TNotificationTemplate } from '../types';

export const useNotificationTemplates = () => {
  const { data, loading, error } = useQuery<{
    notificationTemplates: TNotificationTemplate[];
  }>(NOTIFICATION_TEMPLATES);

  return {
    templates: data?.notificationTemplates || [],
    loading,
    error,
  };
};
