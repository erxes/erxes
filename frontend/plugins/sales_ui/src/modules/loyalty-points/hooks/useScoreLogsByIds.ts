import { useApolloClient } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { SalesLoyaltyScoreLogsByIdsQuery } from '~/gql/graphql';
import { SALES_LOYALTY_SCORE_LOGS_BY_IDS } from '../graphql';

// Loyalty answers at most this many ids at once.
const LOGS_PER_REQUEST = 100;

export type TScoreLogEntry = NonNullable<
  NonNullable<SalesLoyaltyScoreLogsByIdsQuery['loyaltyScoreLogsByIds']>[number]
>;

const chunk = (ids: string[]) =>
  Array.from({ length: Math.ceil(ids.length / LOGS_PER_REQUEST) }, (_, i) =>
    ids.slice(i * LOGS_PER_REQUEST, (i + 1) * LOGS_PER_REQUEST),
  );

/** Loyalty's entries for the ids loaded so far, asked once per id. */
export const useScoreLogsByIds = (ids: string[]) => {
  const client = useApolloClient();
  const [logs, setLogs] = useState<Map<string, TScoreLogEntry>>(
    () => new Map(),
  );
  const [asked, setAsked] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<Error | null>(null);
  const missing = ids.filter((id) => !asked.has(id));
  const missingKey = missing.join(',');

  useEffect(() => {
    if (!missingKey) {
      return;
    }

    const wanted = missingKey.split(',');

    setAsked((prev) => new Set([...prev, ...wanted]));

    Promise.all(
      chunk(wanted).map((part) =>
        client.query({
          query: SALES_LOYALTY_SCORE_LOGS_BY_IDS,
          variables: { ids: part },
          fetchPolicy: 'network-only',
        }),
      ),
    )
      .then((results) => {
        setLogs((prev) => {
          const next = new Map(prev);

          results
            .flatMap(({ data }) => data.loyaltyScoreLogsByIds || [])
            .filter(isDefined)
            .forEach((log) => log._id && next.set(log._id, log));

          return next;
        });
      })
      .catch((err: Error) => {
        // Asked again on the next try.
        setAsked((prev) => {
          const next = new Set(prev);
          wanted.forEach((id) => next.delete(id));
          return next;
        });
        setError(err);
      });
  }, [client, missingKey]);

  const reset = () => {
    setAsked(new Set());
    setLogs(new Map());
    setError(null);
  };

  return { logs, loading: !!missing.length && !error, error, reset };
};
