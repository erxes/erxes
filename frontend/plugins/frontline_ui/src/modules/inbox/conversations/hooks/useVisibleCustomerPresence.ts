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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLElement)) return;
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
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
      },
      { root },
    );
    root
      .querySelectorAll('[data-inbox-customer-id]')
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
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
