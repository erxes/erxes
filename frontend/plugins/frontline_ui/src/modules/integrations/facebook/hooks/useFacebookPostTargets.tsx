import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrations } from '@/integrations/hooks/useIntegrations';
import { IntegrationType } from '@/types/Integration';
import { useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TFacebookPostForm } from '../constants/FbPostSchema';

const POST_INTEGRATIONS_LIMIT = 100;

export const useFacebookPostTargets = (
  form: UseFormReturn<TFacebookPostForm>,
) => {
  const integrationId = form.watch('integrationId');

  const { integrations, loading: loadingIntegrations } = useIntegrations({
    variables: {
      kind: IntegrationType.FACEBOOK_POST,
      channelId: '',
      limit: POST_INTEGRATIONS_LIMIT,
    },
  });

  const postIntegrations = useMemo(
    () =>
      (integrations || []).filter(
        (integration) => integration.isActive !== false,
      ),
    [integrations],
  );

  const { integrationDetail, loading: loadingPages } = useIntegrationDetail({
    integrationId: integrationId || null,
  });

  const pages = useMemo(
    () => integrationDetail?.facebookPage || [],
    [integrationDetail],
  );

  useEffect(() => {
    if (postIntegrations.length && !form.getValues('integrationId')) {
      form.setValue('integrationId', postIntegrations[0]._id);
    }
  }, [postIntegrations, form]);

  useEffect(() => {
    const selected = form.getValues('pageId');

    if (pages.length && !pages.some((page) => page.pageId === selected)) {
      form.setValue('pageId', pages[0].pageId);
    }
  }, [pages, form]);

  return { postIntegrations, pages, loadingIntegrations, loadingPages };
};
