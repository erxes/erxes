import { Button } from 'erxes-ui';
import { IconPointerUp } from '@tabler/icons-react';
import { SelectDealsBulk } from './SelectDealsBulk';
import { dealChooserSheetState } from '@/deals/states/dealCreateSheetState';
import { useSetAtom } from 'jotai';

const ChooseDealSheet = ({
  onComplete,
  showText,
}: {
  onComplete: (dealId: string) => void;
  showText?: boolean;
}) => {
  const setOpenDealChooser = useSetAtom(dealChooserSheetState);

  return (
    <SelectDealsBulk
      dealIds={[]}
      onSelect={(dealIds) => {
        // append(
        //   dealIds.map((dealId) => ({
        //     ...detailDefaultValues,
        //     dealId,
        //   })),
        // );
      }}
    >
      <Button variant="secondary" onClick={() => setOpenDealChooser(true)}>
        <IconPointerUp />
        {showText && 'Choose an existing deal'}
      </Button>
    </SelectDealsBulk>
  );
};

export default ChooseDealSheet;
