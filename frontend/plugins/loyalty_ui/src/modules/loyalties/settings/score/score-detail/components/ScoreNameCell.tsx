import { useQueryState } from 'erxes-ui';
import { IScore } from '../../types/loyaltyScoreTypes';

interface ScoreNameCellProps {
  score: IScore;
  name: string;
}

export const ScoreNameCell = ({ score, name }: ScoreNameCellProps) => {
  const [, setEditOpen] = useQueryState('editScoreId');

  return (
    <span
      role="button"
      tabIndex={0}
      className="cursor-pointer px-3 py-2"
      onClick={() => {
        setEditOpen(score._id);
      }}
    >
      {name}
    </span>
  );
};
