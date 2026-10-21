import { MAIL_VERIFIED_CONTACTS_QUERY } from '@/integrations/mail/composer/graphql/queries/mailRecipients';
import { useDirectMailRecipientStateContext } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientStateContext';
import type { RecipientSuggestions } from '@/integrations/mail/composer/types/directMailRecipientSuggestions';
import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useDirectMailRecipientSuggestions = (): RecipientSuggestions => {
  const { searchReady, searchValue, draft, selected } =
    useDirectMailRecipientStateContext();
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const { data, previousData, loading, error, fetchMore, refetch } = useQuery(
    MAIL_VERIFIED_CONTACTS_QUERY,
    {
      variables: { searchValue },
      skip: !searchReady,
    },
  );

  const contacts = data ?? previousData;

  const options = useMemo(() => {
    const byEmail = new Map<
      string,
      { email: string; customerId: string; name: string }
    >();
    for (const contact of contacts?.customers.list ?? []) {
      if (!['valid', 'verified'].includes(contact.emailValidationStatus ?? ''))
        continue;
      const name = [contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(' ');
      const email = contact.primaryEmail;
      if (email && !byEmail.has(email.toLowerCase())) {
        byEmail.set(email.toLowerCase(), {
          email,
          customerId: contact._id,
          name,
        });
      }
    }
    return [...byEmail.values()].filter(
      ({ email }) =>
        !selected.some((item) => item.toLowerCase() === email.toLowerCase()),
    );
  }, [contacts, selected]);

  const showSuggestions =
    searchReady && (loading || Boolean(error) || options.length > 0);

  useEffect(() => setLoadMoreError(false), [searchValue]);

  const loadMore = useCallback(() => {
    const cursor = data?.customers.pageInfo.endCursor;
    if (
      !showSuggestions ||
      draft.trim() !== searchValue ||
      loading ||
      isFetchingRef.current ||
      !cursor ||
      !data?.customers.pageInfo.hasNextPage
    )
      return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    fetchMore({
      variables: { cursor, searchValue },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previous;
        const loadedIds = new Set(
          previous.customers.list.map(({ _id }) => _id),
        );
        return {
          customers: {
            ...fetchMoreResult.customers,
            list: [
              ...previous.customers.list,
              ...fetchMoreResult.customers.list.filter(
                ({ _id }) => !loadedIds.has(_id),
              ),
            ],
          },
        };
      },
    })
      .then(({ data: next }) => {
        if (
          next.customers.pageInfo.hasNextPage &&
          next.customers.pageInfo.endCursor === cursor
        )
          setLoadMoreError(true);
      })
      .catch(() => setLoadMoreError(true))
      .finally(() => {
        isFetchingRef.current = false;
        setLoadingMore(false);
      });
  }, [data, draft, fetchMore, showSuggestions, searchValue, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const list = listRef.current;
    if (
      !showSuggestions ||
      !sentinel ||
      !list ||
      loadMoreError ||
      !data?.customers.pageInfo.hasNextPage
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: list, rootMargin: '0px 0px 80px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    data?.customers.list.length,
    data?.customers.pageInfo.hasNextPage,
    showSuggestions,
    loadMore,
    loadMoreError,
  ]);

  return {
    options,
    showSuggestions,
    loading,
    error,
    refetch,
    loadMoreError,
    loadingMore,
    hasNextPage: Boolean(data?.customers.pageInfo.hasNextPage),
    listRef,
    sentinelRef,
    retryLoadMore: () => {
      setLoadMoreError(false);
      loadMore();
    },
  };
};
