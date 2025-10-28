import { ScrollArea, Spinner } from 'erxes-ui';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { ITriage } from '@/triage/types/triage';
import { NoTriageSelected } from './NoTriageSelected';

export const TriageContent = () => {
  const { triage, loading } = useGetTriage();

  if (loading) {
    return <Spinner />;
  }

  if (!triage) {
    return <NoTriageSelected />;
  }

  return (
    <ScrollArea className="overflow-hidden h-full">
      <TriageContentWrapper triage={triage} />
    </ScrollArea>
  );
};

const TriageContentWrapper = ({ triage }: { triage: ITriage }) => {
  return <div>TriageContent</div>;
};
