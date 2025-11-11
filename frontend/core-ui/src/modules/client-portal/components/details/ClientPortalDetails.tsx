import { useClientPortal } from '@/client-portal/hooks/useClientPortal';

import { useParams } from 'react-router-dom';
import { ClientPortalGeneralFields } from './ClientPortalGeneralFields';

export const ClientPortalDetails = () => {
  const { clientPortalId } = useParams<{ clientPortalId: string }>();

  const { clientPortal, loading, error } = useClientPortal(
    clientPortalId ?? '',
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <ClientPortalGeneralFields clientPortal={clientPortal ?? {}} />
    </div>
  );
};
