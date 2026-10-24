import {
  dealCreateDefaultValuesState,
  dealCreateSheetState,
} from '@/deals/states/dealCreateSheetState';
import { useStages } from '@/deals/stage/hooks/useStages';
import { IconPlus } from '@tabler/icons-react';
import { Button, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const AddDealButton = () => {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);
  const setDefaultValues = useSetAtom(dealCreateDefaultValuesState);

  const { stages } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const firstStageId = pipelineId ? stages[0]?._id : undefined;

  const handleClick = () => {
    if (!firstStageId) return;
    setDefaultValues({ stageId: firstStageId, pipelineId });
    setOpenCreateDeal(true);
  };

  return (
    <Button onClick={handleClick} disabled={!firstStageId}>
      <IconPlus />
      {t('add-deal')}
    </Button>
  );
};
