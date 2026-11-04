import { useCallback, useEffect, useState } from 'react';

// Loads from the extensions runtime, which is plain HTTP, not GraphQL.
export const useExtensionsQuery = <T>(load: () => Promise<T>) => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setData(await load());
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
};
