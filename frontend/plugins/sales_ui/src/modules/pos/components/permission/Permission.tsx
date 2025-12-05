import { InfoCard } from 'erxes-ui';
import { AdminPermissions } from './AdminPermissions';
import { CashierPermissions } from './CashierPermissions';
import { isFieldVisible } from '../../constants';

interface PermissionProps {
  posId?: string;
  posType?: string;
}

const Permission: React.FC<PermissionProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      {isFieldVisible('admin', posType) && (
        <InfoCard title="Admins">
          <InfoCard.Content>
            <AdminPermissions posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('cashier', posType) && (
        <InfoCard title="Cashiers">
          <InfoCard.Content>
            <CashierPermissions posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};

export default Permission;
