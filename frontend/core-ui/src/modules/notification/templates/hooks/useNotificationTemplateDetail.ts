import { useQuery } from '@apollo/client';
import { NOTIFICATION_TEMPLATE_DETAIL } from '../graphql/notificationTemplateQueries';
import { TNotificationTemplate } from '../types';

export const useNotificationTemplateDetail = (key: string) => {
  const { data, loading, error, refetch } = useQuery<{
    notificationTemplateDetail: TNotificationTemplate;
  }>(NOTIFICATION_TEMPLATE_DETAIL, {
    variables: { key },
    skip: !key,
    // a stale revision would make the next save look like a conflict
    fetchPolicy: 'network-only',
  });

  return {
    template: data?.notificationTemplateDetail,
    loading,
    error,
    refetch,
  };
};
