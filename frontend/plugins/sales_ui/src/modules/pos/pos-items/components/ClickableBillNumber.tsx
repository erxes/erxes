import { RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';

interface ClickableBillNumberProps {
  value: string;
  row: any;
}

export const ClickableBillNumber = ({
  value,
  row,
}: ClickableBillNumberProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    const orderId = row.original._id;
    if (!orderId) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_order_id', orderId);
    setSearchParams(newSearchParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <RecordTableInlineCell>
      <button
        type="button"
        className="cursor-pointer bg-transparent border-none p-0 text-inherit"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <TextOverflowTooltip value={value} />
      </button>
    </RecordTableInlineCell>
  );
};
