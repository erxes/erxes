import { useConvertToProject } from '@/task/hooks/useConvertToProject';
import { Button } from 'erxes-ui';

export const ConverToProject = ({ taskId }: { taskId: string }) => {
  const { convertTask } = useConvertToProject();

  const handleConvert = () => {
    convertTask({ variables: { id: taskId } });
  };

  return (
    <Button variant="outline" onClick={handleConvert}>
      Convert to Project
    </Button>
  );
};
