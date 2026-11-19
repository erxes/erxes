import { useLayoutEffect, useRef, useState } from 'react';

export const useListPushGuard = (
  refetch: () => Promise<unknown>,
  loading: boolean,
  skip = false,
) => {
  const loadingRef = useRef(loading);
  const refetchRef = useRef(refetch);
  const skipRef = useRef(skip);

  const [guard] = useState(() => {
    let mounted = true;
    let pendingRequests = 0;
    let dirty = false;

    const flush = () => {
      if (mounted && dirty && !pendingRequests) {
        reload();
      }
    };

    const reload = () => {
      dirty = false;
      pendingRequests += 1;

      refetchRef.current().then(
        () => {
          pendingRequests -= 1;
          flush();
        },
        () => {
          pendingRequests -= 1;
          dirty = true;
        },
      );
    };

    const track = <T>(request: Promise<T>) => {
      pendingRequests += 1;
      const settle = () => {
        pendingRequests -= 1;
        flush();
      };
      request.then(settle, settle);
      return request;
    };

    const canApplyPush = <T>(
      list: T | null | undefined,
      hasMore?: boolean | null,
    ): list is T => {
      if (
        list &&
        !hasMore &&
        !dirty &&
        !pendingRequests &&
        !loadingRef.current
      ) {
        return true;
      }

      if (!skipRef.current) {
        dirty = true;
        flush();
      }

      return false;
    };

    const attach = () => {
      mounted = true;

      return () => {
        mounted = false;
        dirty = false;
      };
    };

    return { canApplyPush, track, attach };
  });

  useLayoutEffect(() => {
    loadingRef.current = loading;
    refetchRef.current = refetch;
    skipRef.current = skip;
  });

  useLayoutEffect(() => guard.attach(), [guard]);

  return { canApplyPush: guard.canApplyPush, track: guard.track };
};
