import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSidePanelRecordPath, SIDE_PANEL_QUERY_KEY } from 'ui-modules';

/**
 * Opens an old contact link (`?contactId=` / `?companyId=`) in the side
 * panel, where customers and companies now open.
 */
export const ContactDetailLink = ({
  queryKey,
  contentType,
}: {
  queryKey: 'contactId' | 'companyId';
  contentType: 'core:customer' | 'core:company';
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedId = searchParams.get(queryKey);

  useEffect(() => {
    if (!linkedId) {
      return;
    }

    // One navigation, so neither change overwrites the other.
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(queryKey);
        next.set(
          SIDE_PANEL_QUERY_KEY,
          getSidePanelRecordPath({ contentType, contentId: linkedId }),
        );
        return next;
      },
      { replace: true },
    );
  }, [linkedId, queryKey, contentType, setSearchParams]);

  return null;
};
