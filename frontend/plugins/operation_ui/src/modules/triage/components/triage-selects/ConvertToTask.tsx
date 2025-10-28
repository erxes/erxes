import { useConvertTriage } from '@/triage/hooks/useConvertTriage';
import { Button } from 'erxes-ui';

export const ConverToTask = ({ triageId }: { triageId: string }) => {
  const { convertTriageToTask } = useConvertTriage();

  const handleConvert = () => {
    convertTriageToTask({ variables: { id: triageId } });
  };

  return (
    <Button variant="outline" onClick={handleConvert}>
      Accept as Task
    </Button>
  );
};
