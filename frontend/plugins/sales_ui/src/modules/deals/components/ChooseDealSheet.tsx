import { Button } from 'erxes-ui';
import { IconPointerUp } from '@tabler/icons-react';
import { SelectDealsBulk } from './SelectDealsBulk';
import { dealChooserSheetState } from '@/deals/states/dealCreateSheetState';
import { useSetAtom } from 'jotai';

const ChooseDealSheet = ({
  onComplete,
}: {
  onComplete: (dealId: string) => void;
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
      </Button>
    </SelectDealsBulk>
  );
};

export default ChooseDealSheet;
