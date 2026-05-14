import { RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
import { Row } from '@tanstack/react-table';
import { ILottery } from '../types/lottery';
import { useSearchParams } from 'react-router-dom';

interface ClickableLotteryNumberProps {
  value: string;
  row: Row<ILottery>;
}

export const ClickableLotteryNumber = ({
  value,
  row,
}: ClickableLotteryNumberProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    const lotteryId = row.original._id;
    if (!lotteryId) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('lottery_id', lotteryId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTableInlineCell>
      <button
        type="button"
        className="cursor-pointer bg-transparent border-0 p-0 text-inherit text-left w-full"
        onClick={handleClick}
      >
        <TextOverflowTooltip value={value} />
      </button>
    </RecordTableInlineCell>
  );
};
