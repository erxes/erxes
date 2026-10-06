import { useTranslation } from 'react-i18next';
import { IconArrowRight, IconCircleOff, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { FxaOwnerRecordActionSheet } from './FxaOwnerRecordActionSheet';

export const FxaOwnerRecordActions = () => {
  const { t } = useTranslation('accounting');
  return (
    <div className="flex items-center gap-2">
      <FxaOwnerRecordActionSheet mode="receive">
        <Button>
          <IconPlus />
          {t('create')}
        </Button>
      </FxaOwnerRecordActionSheet>
      <FxaOwnerRecordActionSheet mode="transfer">
        <Button variant="secondary">
          <IconArrowRight />
          {t('transfer')}
        </Button>
      </FxaOwnerRecordActionSheet>
      <FxaOwnerRecordActionSheet mode="handOver">
        <Button variant="secondary">
          <IconCircleOff />
          {t('cancel')}
        </Button>
      </FxaOwnerRecordActionSheet>
    </div>
  );
};
