import { useConvertTriage } from '@/triage/hooks/useConvertTriage';
import { Button } from 'erxes-ui';

export const ConvertToTask = ({ triageId }: { triageId: string }) => {
  const { convertTriageToTask, loading } = useConvertTriage();

  const handleConvert = () => {
    convertTriageToTask({ variables: { id: triageId } });
  };

  return (
    <Button variant="outline" onClick={handleConvert} disabled={loading}>
      Accept as Task
    </Button>
  );
};
