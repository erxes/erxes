import { useQueryState } from 'erxes-ui';
import { ISpin } from '../../types/spinTypes';

interface SpinNameCellProps {
  spin: ISpin;
  name: string;
}

export const SpinNameCell = ({ spin, name }: SpinNameCellProps) => {
  const [, setEditOpen] = useQueryState('editSpinId');

  return (
    <button
      className="cursor-pointer px-3 py-2"
      onClick={() => {
        setEditOpen(spin._id);
      }}
    >
      {name}
    </button>
  );
};
