import { useClientPortal } from '@/client-portal/hooks/useClientPortal';

import { useParams } from 'react-router-dom';
import { ClientPortalGeneralFields } from './ClientPortalDetailsGeneralFields';
import { ScrollArea } from 'erxes-ui';
import { ClientPortalDetailAuth } from './ClientPortalDetailAuth';

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
    <ScrollArea className="flex-auto overflow-hidden" viewportClassName="p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 col-span-2">
          <ClientPortalGeneralFields clientPortal={clientPortal ?? {}} />
          <ClientPortalDetailAuth clientPortal={clientPortal ?? {}} />
        </div>
        <div className="flex flex-col gap-4"></div>
      </div>
    </ScrollArea>
  );
};
