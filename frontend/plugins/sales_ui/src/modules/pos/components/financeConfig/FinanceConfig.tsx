import { InfoCard } from 'erxes-ui';
import { Main } from '@/pos/components/financeConfig/Main';
import { Remainder } from '@/pos/components/financeConfig/Remainder';
import { isFieldVisible } from '@/pos/constants';

interface FinanceConfigProps {
  posId?: string;
  posType?: string;
}

const FinanceConfig: React.FC<FinanceConfigProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      {isFieldVisible('erkhetSetup', posType) && (
        <InfoCard title="Main">
          <InfoCard.Content>
            <Main posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('remainderInventorySync', posType) && (
        <InfoCard title="Remainder">
          <InfoCard.Content>
            <Remainder posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};

export default FinanceConfig;
