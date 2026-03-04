import { useClientPortal } from '@/client-portal/hooks/useClientPortal';

import { useParams } from 'react-router-dom';
import { ClientPortalGeneral } from './ClientPortalDetailsGeneral';
import { ScrollArea, Spinner } from 'erxes-ui';
import { ClientPortalDetailAuth } from './ClientPortalDetailAuth';
import { ClientPortalDetailTest } from './ClientPortalDetailTest';
import { ClientPortalDetailAuthLogics } from './ClientPortalDetailAuthLogics';
import { ClientPortalDetail3rdPartyAuths } from './ClientPortalDetail3rdPartyAuths';
import { ClientPortalDetailToken } from './ClientPortalDetailToken';
import { ClientPortalDetailSMSProviders } from './ClientPortalDetailSMSProviders';
import { ClientPortalDetailFirebase } from './ClientPortalDetailFirebase';

export const ClientPortalDetails = () => {
  const { clientPortalId } = useParams<{ clientPortalId: string }>();

  const { clientPortal, loading, error } = useClientPortal(
    clientPortalId ?? '',
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Error: {error.message}
      </div>
    );
  }

  return (
    <ScrollArea className="flex-auto overflow-hidden" viewportClassName="p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 mb-4">
          <ClientPortalGeneral clientPortal={clientPortal} />
        </div>
        <div>
          <ClientPortalDetailToken clientPortal={clientPortal} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 col-span-2">
          <ClientPortalDetailAuth clientPortal={clientPortal} />
          <ClientPortalDetailAuthLogics clientPortal={clientPortal} />
          <ClientPortalDetail3rdPartyAuths clientPortal={clientPortal} />
        </div>
        <div className="flex flex-col gap-4">
          <ClientPortalDetailTest clientPortal={clientPortal} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ClientPortalDetailSMSProviders clientPortal={clientPortal} />
        <ClientPortalDetailFirebase clientPortal={clientPortal} />
      </div>
    </ScrollArea>
  );
};
