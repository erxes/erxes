import { useQueryState } from 'erxes-ui';
import { IAssignment } from '../../types/assignmentTypes';

interface AssignmentNameCellProps {
  assignment: IAssignment;
  name: string;
}

export const AssignmentNameCell = ({
  assignment,
  name,
}: AssignmentNameCellProps) => {
  const [, setEditOpen] = useQueryState('editAssignmentId');

  return (
    <div
      className="cursor-pointer px-3 py-2"
      onClick={() => {
        setEditOpen(assignment._id);
      }}
    >
      {name}
    </div>
  );
};
