import { ApolloCache, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GET_CUSTOM_DOMAIN } from '@/helpcenter/graphql/queries/getCustomDomain';
import {
  REFRESH_CUSTOM_DOMAIN,
  RESET_CUSTOM_DOMAIN,
  SAVE_CUSTOM_DOMAIN,
} from '@/helpcenter/graphql/mutations/customDomain';
import { ICustomDomain } from '@/helpcenter/types';

export const useCustomDomain = (helpCenterId: string) => {
  const { data, loading, error, refetch } = useQuery<{
    frontlineCustomDomain: ICustomDomain | null;
  }>(GET_CUSTOM_DOMAIN, {
    variables: { helpCenterId },
    fetchPolicy: 'cache-and-network',
  });

  return {
    customDomain: data?.frontlineCustomDomain ?? null,
    loading,
    error,
    refetch,
  };
};

// Each mutation answers with the whole domain view, so writing it over the
// query keeps the page current without a second round trip.
const updateView = (
  cache: ApolloCache<unknown>,
  helpCenterId: string,
  view?: ICustomDomain | null,
) => {
  if (view) {
    cache.writeQuery({
      query: GET_CUSTOM_DOMAIN,
      variables: { helpCenterId },
      data: { frontlineCustomDomain: view },
    });
  }
};

export const useCustomDomainActions = (helpCenterId: string) => {
  const { t } = useTranslation('frontline');
  const variables = { helpCenterId };

  const onError = (error: Error) =>
    toast({
      title: t('error', 'Error'),
      description: error.message,
      variant: 'destructive',
    });

  const [save, { loading: saving }] = useMutation(SAVE_CUSTOM_DOMAIN, {
    update: (cache, { data }) =>
      updateView(cache, helpCenterId, data?.frontlineCustomDomainSave),
    onError,
  });

  const [refresh, { loading: refreshing }] = useMutation(
    REFRESH_CUSTOM_DOMAIN,
    {
      update: (cache, { data }) =>
        updateView(cache, helpCenterId, data?.frontlineCustomDomainRefresh),
      onError,
    },
  );

  const [reset, { loading: resetting }] = useMutation(RESET_CUSTOM_DOMAIN, {
    update: (cache, { data }) =>
      updateView(cache, helpCenterId, data?.frontlineCustomDomainReset),
    onError,
  });

  return {
    saveDomain: (hostname: string) =>
      save({
        variables: { ...variables, hostname },
        onCompleted: () =>
          toast({
            title: t('customdomain-saved', 'Domain added'),
            description: t(
              'customdomain-saved-description',
              'Add the DNS records below to finish connecting it.',
            ),
            variant: 'success',
          }),
      }),
    refreshDomain: () =>
      refresh({
        variables,
        onCompleted: () =>
          toast({
            title: t('customdomain-refreshed', 'Status updated'),
            variant: 'success',
          }),
      }),
    resetDomain: () =>
      reset({
        variables,
        onCompleted: () =>
          toast({
            title: t('customdomain-reset-done', 'Domain disconnected'),
            variant: 'success',
          }),
      }),
    saving,
    refreshing,
    resetting,
  };
};
