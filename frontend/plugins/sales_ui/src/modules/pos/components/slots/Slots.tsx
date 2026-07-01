import { InfoCard } from 'erxes-ui';
import POSSlotsManager from '@/pos/slot/components/slot';
import { usePosSlots } from '@/pos/hooks/usePosSlots';
import { useTranslation } from 'react-i18next';

interface SlotsProps {
  posId: string;
}

const Slots: React.FC<SlotsProps> = ({ posId }) => {
  const { t } = useTranslation('sales');
  const { nodes, setNodes, loading } = usePosSlots(posId);

  if (loading) {
    return (
      <div className="flex flex-col p-6 h-full overflow-hidden">
        <InfoCard title={t('slots')}>
          <InfoCard.Content>
            <div className="h-64 rounded animate-pulse bg-muted" />
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 h-full overflow-hidden">
      <InfoCard title={t('slots')} className="flex-1 min-h-0 flex flex-col">
        <InfoCard.Content className="flex-1 min-h-0">
          <POSSlotsManager
            posId={posId}
            initialNodes={nodes}
            onNodesChange={setNodes}
            isCreating={false}
          />
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Slots;
