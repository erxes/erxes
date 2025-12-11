import { Spinner } from 'erxes-ui/components';
import { usePosList } from '@/pos/hooks/usePosList';
import { PosEmptyState } from '@/pos/components/PosEmptyState';

export const PosContent = () => {
  const { posList, loading } = usePosList();

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Spinner />
      </div>
    );
  }

  if (!posList || posList.length === 1) {
    return <PosEmptyState />;
  }

  return (
    <div className="flex-1 p-6">
      <p className="text-muted-foreground">
        You have {posList.length} POS configured.
      </p>
    </div>
  );
};
