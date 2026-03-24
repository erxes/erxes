import { InfoCard } from 'erxes-ui';
import { Stage } from '@/pos/components/deliveryConfig/Stage';
import { DealUsers } from '@/pos/components/deliveryConfig/DealUsers';
import { isFieldVisible } from '@/pos/constants';

interface DeliveryConfigProps {
  posId?: string;
  posType?: string;
}

const DeliveryConfig: React.FC<DeliveryConfigProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      {isFieldVisible('deliveryAutomation', posType) && (
        <InfoCard title="Stage">
          <InfoCard.Content>
            <Stage posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('deliveryProduct', posType) && (
        <InfoCard title="Deal Users">
          <InfoCard.Content>
            <DealUsers posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};

export default DeliveryConfig;
