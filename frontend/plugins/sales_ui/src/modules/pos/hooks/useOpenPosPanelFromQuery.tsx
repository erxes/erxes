import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSidePanelRecordPath, SIDE_PANEL_QUERY_KEY } from 'ui-modules';

const keepId = (value: string) => value;

export const useOpenPosPanelFromQuery = (
  queryKey: string,
  contentType: string,
  toContentId: (value: string) => string = keepId,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(queryKey);

  useEffect(() => {
    if (!value) {
      return;
    }

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(queryKey);
        next.set(
          SIDE_PANEL_QUERY_KEY,
          getSidePanelRecordPath({
            contentType,
            contentId: toContentId(value),
          }),
        );
        return next;
      },
      { replace: true },
    );
  }, [value, queryKey, contentType, toContentId, setSearchParams]);
};
