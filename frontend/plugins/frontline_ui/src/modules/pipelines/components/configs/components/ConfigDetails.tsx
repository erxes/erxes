import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSidePanel } from 'ui-modules';
import { TICKET_CONFIG_CONTENT_TYPE } from '@/settings/constants/recordPanels';

export const ConfigDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const configId = searchParams.get('configId');
  const requestedConfigId = useRef<string | null>(null);
  const { openRecord } = useSidePanel();

  useEffect(() => {
    if (configId) {
      requestedConfigId.current = configId;
      const queries = new URLSearchParams(location.search);
      queries.delete('configId');
      navigate(
        {
          pathname: location.pathname,
          search: queries.toString(),
          hash: location.hash,
        },
        { replace: true, state: location.state },
      );
      return;
    }
    const requestedId = requestedConfigId.current;
    if (!requestedId) return;
    requestedConfigId.current = null;
    openRecord(
      { contentType: TICKET_CONFIG_CONTENT_TYPE, contentId: requestedId },
      { stack: true },
    );
  }, [
    configId,
    location.hash,
    location.pathname,
    location.search,
    location.state,
    navigate,
    openRecord,
  ]);

  return null;
};
