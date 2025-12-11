import { Spinner } from 'erxes-ui/components';
import { usePosList } from '@/pos/hooks/usePosList';
import { PosEmptyState } from '@/pos/components/PosEmptyState';
import { PosCardGrid } from '@/pos/components/PosRecordList';

interface PosContentProps {
  onCreatePos?: () => void;
}

export const PosContent = ({ onCreatePos }: PosContentProps) => {
  const { posList, loading } = usePosList();

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Spinner />
      </div>
    );
  }

  if (!posList || posList.length === 0) {
    return <PosEmptyState isCreate={false} onCreatePos={onCreatePos} />;
  }

  return <PosCardGrid onCreatePos={onCreatePos} />;
};
