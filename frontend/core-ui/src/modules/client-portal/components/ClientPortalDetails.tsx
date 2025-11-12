import { useClientPortal } from '@/client-portal/hooks/useClientPortal';

import { useParams } from 'react-router-dom';
import { ClientPortalGeneralFields } from './ClientPortalDetailsGeneralFields';
import { ScrollArea, Spinner } from 'erxes-ui';
import { ClientPortalDetailAuth } from './ClientPortalDetailAuth';
import { ClientPortalDetailTest } from './ClientPortalDetailTest';
import { ClientPortalDetailOtp } from './ClientPortalDetailOtp';
import { ClientPortalDetailAuthLogics } from './ClientPortalDetailAuthLogics';
import { ClientPortalDetailThirdPartyAuth } from './ClientPortalDetailThirdPartyAuth';

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
          <ClientPortalGeneralFields clientPortal={clientPortal ?? {}} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 col-span-2">
          <ClientPortalDetailAuth clientPortal={clientPortal ?? {}} />
          <ClientPortalDetailAuthLogics />
          <ClientPortalDetailThirdPartyAuth />
        </div>
        <div className="flex flex-col gap-4">
          <ClientPortalDetailTest />
        </div>
      </div>
    </ScrollArea>
  );
};
