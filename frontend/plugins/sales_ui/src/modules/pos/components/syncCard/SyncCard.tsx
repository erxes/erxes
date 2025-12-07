import { InfoCard } from 'erxes-ui';
import { SyncList } from '@/pos/components/syncCard/SyncList';
import { isFieldVisible } from '@/pos/constants';

interface SyncCardProps {
  posId?: string;
  posType?: string;
}

const SyncCard: React.FC<SyncCardProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      {isFieldVisible('branchPipelineMapping', posType) && (
        <InfoCard title="Sync Cards">
          <InfoCard.Content>
            <SyncList posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};

export default SyncCard;
