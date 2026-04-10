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
      <div className="cursor-pointer" onClick={handleClick}>
        <TextOverflowTooltip value={value} />
      </div>
    </RecordTableInlineCell>
  );
};
