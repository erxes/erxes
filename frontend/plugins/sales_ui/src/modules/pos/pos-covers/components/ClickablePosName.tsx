import { POS_COVER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';

interface ClickablePosNameProps {
  value: string;
  coverId?: string;
}

export const ClickablePosName = ({ value, coverId }: ClickablePosNameProps) => {
  const { openRecord } = useSidePanel();

  const handleClick = () => {
    if (!coverId) {
      return;
    }
    openRecord({ contentType: POS_COVER_CONTENT_TYPE, contentId: coverId });
  };

  return (
    <RecordTableInlineCell>
      <div className="cursor-pointer" onClick={handleClick}>
        <TextOverflowTooltip value={value} />
      </div>
    </RecordTableInlineCell>
  );
};
