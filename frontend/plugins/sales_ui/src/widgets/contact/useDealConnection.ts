import { EDIT_DEALS } from '@/deals/graphql/mutations/DealsMutations';
import { evictContactDealLists } from '@/deals/utils/dealCache';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import {
  getDealContactUpdate,
  SALES_DEAL_CONNECTION_CANDIDATES,
  SALES_DEAL_CONNECTION_CONTACTS,
  TDealConnectionContact,
} from './dealContactConnection';

const PAGE_SIZE = 30;

export const useDealConnection = (
  contact: TDealConnectionContact,
  onConnected: () => void,
) => {
  const { t } = useTranslation('sales');
  const client = useApolloClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [connecting, setConnecting] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [editDeal] = useMutation(EDIT_DEALS);
  const { data, loading, error, fetchMore, refetch } = useQuery(
    SALES_DEAL_CONNECTION_CANDIDATES,
    {
      variables: { search: debouncedSearch || undefined, limit: PAGE_SIZE },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all',
    },
  );
  const deals = (data?.deals?.list || []).flatMap((deal) =>
    deal ? [deal] : [],
  );
  const pageInfo = data?.deals?.pageInfo;
  const isCompany = contact.contentType === 'core:company';

  const connectDeal = async (dealId: string) => {
    if (connecting) return;
    setConnecting(true);

    try {
      const { data: fresh } = await client.query({
        query: SALES_DEAL_CONNECTION_CONTACTS,
        variables: { _id: dealId },
        fetchPolicy: 'network-only',
      });
      const deal = fresh.dealDetail;
      const variables = deal && getDealContactUpdate(deal, contact);
      if (!variables) {
        toast({
          title: t('deal-cannot-connect', 'Deal cannot be connected'),
          description: isCompany
            ? t(
                'deal-company-already-set',
                'This deal already has a company. Choose a deal without one.',
              )
            : t(
                'deal-customer-already-set',
                'This deal already has a customer. Choose a deal without one.',
              ),
          variant: 'destructive',
        });
        await refetch();
        return;
      }

      await editDeal({
        variables,
        update: (cache) => evictContactDealLists(cache),
      });
      toast({
        title: t('deal-connected', 'Deal connected'),
        variant: 'success',
      });
      if (mounted.current) onConnected();
    } catch (connectionError) {
      toast({
        title: t('deal-connect-failed', 'Could not connect deal'),
        description:
          connectionError instanceof Error
            ? connectionError.message
            : undefined,
        variant: 'destructive',
      });
    } finally {
      if (mounted.current) setConnecting(false);
    }
  };

  const loadMore = () => {
    if (
      loading ||
      connecting ||
      search !== debouncedSearch ||
      !pageInfo?.hasNextPage ||
      !pageInfo.endCursor
    )
      return;
    void fetchMore({
      variables: { cursor: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!previous.deals || !fetchMoreResult.deals) return previous;
        const merged = new Map(
          [
            ...(previous.deals.list ?? []),
            ...(fetchMoreResult.deals.list ?? []),
          ].flatMap((deal) => (deal ? [[deal._id, deal] as const] : [])),
        );
        return {
          ...previous,
          deals: { ...fetchMoreResult.deals, list: [...merged.values()] },
        };
      },
    }).catch((fetchError: unknown) => {
      toast({
        title: t('deal-load-more-failed', 'Could not load more deals'),
        description:
          fetchError instanceof Error ? fetchError.message : undefined,
        variant: 'destructive',
      });
    });
  };

  return {
    search,
    setSearch,
    searchPending: search !== debouncedSearch,
    pageKey: `${debouncedSearch}:${pageInfo?.endCursor}`,
    deals,
    hasNextPage: Boolean(pageInfo?.hasNextPage),
    totalCount: data?.deals?.totalCount ?? 0,
    loading,
    error: data?.deals ? undefined : error,
    retry: () => void refetch().catch(() => undefined),
    connecting,
    connectDeal,
    loadMore,
  };
};
