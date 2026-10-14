import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState, type RefObject } from 'react';

const CUSTOMER_PRESENCE = gql`
  query frontlineInboxCustomerPresence($ids: [String], $limit: Int) {
    customers(ids: $ids, limit: $limit) {
      list {
        _id
        isOnline
        lastSeenAt
      }
    }
  }
`;
type CustomerPresence = {
  _id: string;
  isOnline?: boolean | null;
  lastSeenAt?: string | null;
};

export const useVisibleCustomerPresence = (
  container: RefObject<HTMLDivElement>,
  listKey: string,
) => {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const visible = new Set<HTMLElement>();
    const observed = new Set<HTMLElement>();
    const publishVisibleIds = () => {
      const next = [
        ...new Set(
          [...visible]
            .map((element) => element.dataset.inboxCustomerId)
            .filter((id): id is string => Boolean(id)),
        ),
      ].sort((left, right) => left.localeCompare(right));
      setIds((previous) =>
        previous.join(',') === next.join(',') ? previous : next,
      );
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            !(entry.target instanceof HTMLElement) ||
            !observed.has(entry.target)
          )
            return;
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        publishVisibleIds();
      },
      { root },
    );
    const syncMarkers = () => {
      const markers = new Set(
        Array.from(
          root.querySelectorAll<HTMLElement>('[data-inbox-customer-id]'),
        ),
      );
      observed.forEach((element) => {
        if (markers.has(element)) return;
        observer.unobserve(element);
        observed.delete(element);
        visible.delete(element);
      });
      markers.forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        observer.observe(element);
      });
      publishVisibleIds();
    };
    syncMarkers();
    const mutations = new MutationObserver(syncMarkers);
    mutations.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-inbox-customer-id'],
    });
    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [container, listKey]);
  const { data, startPolling, stopPolling } = useQuery<
    { customers?: { list?: CustomerPresence[] } | null },
    { ids: string[]; limit: number }
  >(CUSTOMER_PRESENCE, {
    variables: { ids, limit: ids.length },
    skip: !ids.length,
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => {
    const updatePolling = () => {
      if (ids.length && document.visibilityState === 'visible')
        startPolling(30_000);
      else stopPolling();
    };
    updatePolling();
    document.addEventListener('visibilitychange', updatePolling);
    return () => {
      document.removeEventListener('visibilitychange', updatePolling);
      stopPolling();
    };
  }, [ids.length, startPolling, stopPolling]);
  return useMemo(
    () =>
      new Map(
        data?.customers?.list?.map((customer) => [customer._id, customer]),
      ),
    [data],
  );
};
