import { POS_ORDER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';

interface ClickableBillNumberProps {
  value: string;
  orderId?: string;
}

export const ClickableBillNumber = ({
  value,
  orderId,
}: ClickableBillNumberProps) => {
  const { openRecord } = useSidePanel();

  const handleClick = () => {
    if (!orderId) {
      return;
    }
    openRecord({ contentType: POS_ORDER_CONTENT_TYPE, contentId: orderId });
  };

  return (
    <RecordTableInlineCell>
      <div className="cursor-pointer" onClick={handleClick}>
        <TextOverflowTooltip value={value} />
      </div>
    </RecordTableInlineCell>
  );
};
