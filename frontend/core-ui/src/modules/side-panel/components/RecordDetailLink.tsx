import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getSidePanelRecordPath,
  SIDE_PANEL_QUERY_KEY,
  SIDE_PANEL_HISTORY_QUERY_KEY,
} from 'ui-modules';

export const RecordDetailLink = ({
  queryKey,
  contentType,
}: {
  queryKey: string;
  contentType: string;
}) => {
  const [params, setParams] = useSearchParams();
  const id = params.get(queryKey);

  useEffect(() => {
    if (!id) return;
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(queryKey);
        next.delete(SIDE_PANEL_HISTORY_QUERY_KEY);
        next.set(
          SIDE_PANEL_QUERY_KEY,
          getSidePanelRecordPath({ contentType, contentId: id }),
        );
        return next;
      },
      { replace: true },
    );
  }, [id, queryKey, contentType, setParams]);

  return null;
};
