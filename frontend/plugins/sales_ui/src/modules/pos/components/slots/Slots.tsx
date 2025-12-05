import { InfoCard } from 'erxes-ui';
import POSSlotsManager from '@/pos/slot/components/slot';
import { usePosSlots } from '@/pos/hooks/usePosSlots';

interface SlotsProps {
  posId?: string;
}

const Slots: React.FC<SlotsProps> = ({ posId }) => {
  const { nodes, setNodes, loading } = usePosSlots(posId || '');

  if (loading) {
    return (
      <div className="overflow-y-auto p-6 max-h-screen">
        <InfoCard title="Slots">
          <InfoCard.Content>
            <div className="h-64 rounded animate-pulse bg-muted" />
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-6 max-h-screen">
      <InfoCard title="Slots">
        <InfoCard.Content>
          <div className="h-full">
            <POSSlotsManager
              posId={posId || ''}
              initialNodes={nodes}
              onNodesChange={setNodes}
              isCreating={false}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Slots;
