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

  return (
    <RecordTableInlineCell>
      <button
        type="button"
        className="cursor-pointer"
        onClick={handleClick}
        title={value}
      >
        <TextOverflowTooltip value={value} />
      </button>
    </RecordTableInlineCell>
  );
};
