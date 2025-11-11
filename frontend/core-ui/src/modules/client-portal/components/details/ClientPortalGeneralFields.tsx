import { IClientPortal } from '@/client-portal/types/clientPortal';
import { Label, Input } from 'erxes-ui';

export const ClientPortalGeneralFields = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  return (
    <div>
      <div>
        <Label>Name</Label>
        <Input value={clientPortal?.name} />
      </div>
    </div>
  );
};
