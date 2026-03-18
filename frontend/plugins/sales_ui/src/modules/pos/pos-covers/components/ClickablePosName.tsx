import { RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';

interface ClickablePosNameProps {
  value: string;
  row: any;
}

export const ClickablePosName = ({ value, row }: ClickablePosNameProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    const coverId = row.original._id;
    if (!coverId) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_cover_id', coverId);
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
