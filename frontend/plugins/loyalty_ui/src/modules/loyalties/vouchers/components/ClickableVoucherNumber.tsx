import { RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
import { Row } from '@tanstack/react-table';
import { IVoucher } from '../types/voucher';
import { useSearchParams } from 'react-router-dom';

interface ClickableVoucherNumberProps {
  value: string;
  row: Row<IVoucher>;
}

export const ClickableVoucherNumber = ({
  value,
  row,
}: ClickableVoucherNumberProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    const voucherId = row.original._id;
    if (!voucherId) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('voucher_id', voucherId);
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
