import { useQueryState } from 'erxes-ui';
import { ILottery } from '../../types/lotteryTypes';

interface LotteryNameCellProps {
  lottery: ILottery;
  name: string;
}

export const LotteryNameCell = ({ lottery, name }: LotteryNameCellProps) => {
  const [, setEditOpen] = useQueryState('editLotteryId');

  return (
    <div
      className="cursor-pointer px-3 py-2"
      onClick={() => {
        setEditOpen(lottery._id);
      }}
    >
      {name}
    </div>
  );
};
