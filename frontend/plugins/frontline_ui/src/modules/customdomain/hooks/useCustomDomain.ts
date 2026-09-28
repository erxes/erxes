import { ApolloCache, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GET_CUSTOM_DOMAIN } from '@/customdomain/graphql/queries';
import {
  REFRESH_CUSTOM_DOMAIN,
  RESET_CUSTOM_DOMAIN,
  SAVE_CUSTOM_DOMAIN,
} from '@/customdomain/graphql/mutations';
import { ICustomDomain } from '@/customdomain/types';

export const useCustomDomain = () => {
  const { data, loading, error, refetch } = useQuery<{
    frontlineCustomDomain: ICustomDomain | null;
  }>(GET_CUSTOM_DOMAIN, { fetchPolicy: 'cache-and-network' });

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
  view?: ICustomDomain | null,
) => {
  if (view) {
    cache.writeQuery({
      query: GET_CUSTOM_DOMAIN,
      data: { frontlineCustomDomain: view },
    });
  }
};

export const useCustomDomainActions = () => {
  const { t } = useTranslation('frontline');

  const onError = (error: Error) =>
    toast({
      title: t('error', 'Error'),
      description: error.message,
      variant: 'destructive',
    });

  const [save, { loading: saving }] = useMutation(SAVE_CUSTOM_DOMAIN, {
    update: (cache, { data }) =>
      updateView(cache, data?.frontlineCustomDomainSave),
    onError,
  });

  const [refresh, { loading: refreshing }] = useMutation(
    REFRESH_CUSTOM_DOMAIN,
    {
      update: (cache, { data }) =>
        updateView(cache, data?.frontlineCustomDomainRefresh),
      onError,
    },
  );

  const [reset, { loading: resetting }] = useMutation(RESET_CUSTOM_DOMAIN, {
    update: (cache, { data }) =>
      updateView(cache, data?.frontlineCustomDomainReset),
    onError,
  });

  return {
    saveDomain: (hostname: string) =>
      save({
        variables: { hostname },
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
        onCompleted: () =>
          toast({
            title: t('customdomain-refreshed', 'Status updated'),
            variant: 'success',
          }),
      }),
    resetDomain: () =>
      reset({
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
