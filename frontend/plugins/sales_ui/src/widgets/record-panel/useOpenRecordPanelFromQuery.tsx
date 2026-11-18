import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSidePanelRecordPath, SIDE_PANEL_QUERY_KEY } from 'ui-modules';

const keepId = (value: string) => value;

export const useOpenRecordPanelFromQuery = (
  queryKey: string,
  contentType: string,
  toContentId: (value: string) => string | Promise<string> = keepId,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(queryKey);

  useEffect(() => {
    if (!value) {
      return undefined;
    }

    let cancelled = false;

    Promise.resolve(toContentId(value))
      .then((contentId) => {
        if (cancelled) {
          return;
        }

        setSearchParams(
          (previous) => {
            const next = new URLSearchParams(previous);
            next.delete(queryKey);
            next.set(
              SIDE_PANEL_QUERY_KEY,
              getSidePanelRecordPath({ contentType, contentId }),
            );
            return next;
          },
          { replace: true },
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [value, queryKey, contentType, toContentId, setSearchParams]);
};
