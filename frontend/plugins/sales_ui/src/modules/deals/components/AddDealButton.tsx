import {
  dealCreateDefaultValuesState,
  dealCreateSheetState,
} from '@/deals/states/dealCreateSheetState';
import { dealsViewAtom } from '@/deals/states/dealsViewState';
import { useStages } from '@/deals/stage/hooks/useStages';
import { IconPlus } from '@tabler/icons-react';
import { Button, useQueryState } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const AddDealButton = () => {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');
  const view = useAtomValue(dealsViewAtom);
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);
  const setDefaultValues = useSetAtom(dealCreateDefaultValuesState);

  const { stages } = useStages({
    variables: { pipelineId },
    skip: !pipelineId || view !== 'list',
  });

  const firstStageId = pipelineId ? stages[0]?._id : undefined;

  const handleClick = () => {
    if (!firstStageId) return;
    setDefaultValues({ stageId: firstStageId, pipelineId });
    setOpenCreateDeal(true);
  };

  if (view !== 'list') {
    return null;
  }

  return (
    <Button onClick={handleClick} disabled={!firstStageId}>
      <IconPlus />
      {t('add-deal')}
    </Button>
  );
};
