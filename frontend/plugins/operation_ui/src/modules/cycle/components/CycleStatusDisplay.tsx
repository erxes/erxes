import { Badge } from 'erxes-ui';

export const CycleStatusDisplay = ({
  isActive,
  isCompleted,
}: {
  isActive: boolean;
  isCompleted: boolean;
}) => {
  return (
    <Badge variant={isActive ? 'success' : isCompleted ? 'info' : 'secondary'}>
      {isActive ? 'Active' : isCompleted ? 'Completed' : 'Upcoming'}
    </Badge>
  );
};
