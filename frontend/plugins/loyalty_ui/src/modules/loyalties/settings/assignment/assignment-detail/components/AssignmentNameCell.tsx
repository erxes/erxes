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
    <button
      type="button"
      className="px-3 py-2 cursor-pointer"
      onClick={() => {
        setEditOpen(assignment._id);
      }}
    >
      {name}
    </button>
  );
};
