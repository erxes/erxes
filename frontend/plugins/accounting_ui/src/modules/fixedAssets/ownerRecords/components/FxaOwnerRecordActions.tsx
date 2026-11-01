import { useTranslation } from 'react-i18next';
import { IconArrowRight, IconCircleOff, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { FXA_OWNER_RECORD_CONTENT_TYPES } from '@/fixedAssets/ownerRecords/constants/ownerRecordPanel';

export const FxaOwnerRecordActions = () => {
  const { t } = useTranslation('accounting');
  const { openNewRecord } = useSidePanel();
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => openNewRecord(FXA_OWNER_RECORD_CONTENT_TYPES.receive)}
      >
        <IconPlus />
        {t('create')}
      </Button>
      <Button
        variant="secondary"
        onClick={() => openNewRecord(FXA_OWNER_RECORD_CONTENT_TYPES.transfer)}
      >
        <IconArrowRight />
        {t('transfer')}
      </Button>
      <Button
        variant="secondary"
        onClick={() => openNewRecord(FXA_OWNER_RECORD_CONTENT_TYPES.handOver)}
      >
        <IconCircleOff />
        {t('cancel')}
      </Button>
    </div>
  );
};
