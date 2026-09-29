import { ApolloCache, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GET_WEB_CUSTOM_DOMAINS } from '../graphql/queries/getWebCustomDomains';
import {
  ADD_WEB_CUSTOM_DOMAIN,
  REFRESH_WEB_CUSTOM_DOMAIN,
  REMOVE_WEB_CUSTOM_DOMAIN,
} from '../graphql/mutations/webCustomDomain';
import { IWebCustomDomains } from '../types';

export const useWebCustomDomains = (webId: string) => {
  const { data, loading, error, refetch } = useQuery<{
    webCustomDomains: IWebCustomDomains | null;
  }>(GET_WEB_CUSTOM_DOMAINS, {
    variables: { webId },
    fetchPolicy: 'cache-and-network',
  });

  return {
    customDomains: data?.webCustomDomains ?? null,
    loading,
    error,
    refetch,
  };
};

export const useWebCustomDomainActions = (webId: string) => {
  const { t } = useTranslation('content');

  // Every mutation answers with the web's whole domain list.
  const writeList = (
    cache: ApolloCache<unknown>,
    list?: IWebCustomDomains | null,
  ) => {
    if (list) {
      cache.writeQuery({
        query: GET_WEB_CUSTOM_DOMAINS,
        variables: { webId },
        data: { webCustomDomains: list },
      });
    }
  };

  const onError = (error: Error) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });

  const [add, { loading: adding }] = useMutation(ADD_WEB_CUSTOM_DOMAIN, {
    update: (cache, { data }) => writeList(cache, data?.webCustomDomainAdd),
    onError,
  });

  const [refresh, { loading: refreshing }] = useMutation(
    REFRESH_WEB_CUSTOM_DOMAIN,
    {
      update: (cache, { data }) =>
        writeList(cache, data?.webCustomDomainRefresh),
      onError,
    },
  );

  const [remove, { loading: removing }] = useMutation(
    REMOVE_WEB_CUSTOM_DOMAIN,
    {
      update: (cache, { data }) =>
        writeList(cache, data?.webCustomDomainRemove),
      onError,
    },
  );

  return {
    addDomain: (hostname: string) => add({ variables: { webId, hostname } }),
    refreshDomain: (hostname: string) =>
      refresh({ variables: { webId, hostname } }),
    removeDomain: (hostname: string) =>
      remove({ variables: { webId, hostname } }),
    adding,
    refreshing,
    removing,
  };
};
