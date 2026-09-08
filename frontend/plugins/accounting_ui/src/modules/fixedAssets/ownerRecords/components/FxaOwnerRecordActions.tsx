import { IconArrowRight, IconCircleOff, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { FxaOwnerRecordActionSheet } from './FxaOwnerRecordActionSheet';

export const FxaOwnerRecordActions = () => {
  return (
    <div className="flex items-center gap-2">
      <FxaOwnerRecordActionSheet mode="receive">
        <Button>
          <IconPlus />
          Үүсгэх
        </Button>
      </FxaOwnerRecordActionSheet>
      <FxaOwnerRecordActionSheet mode="transfer">
        <Button variant="secondary">
          <IconArrowRight />
          Шилжүүлэх
        </Button>
      </FxaOwnerRecordActionSheet>
      <FxaOwnerRecordActionSheet mode="handOver">
        <Button variant="secondary">
          <IconCircleOff />
          Цуцлах
        </Button>
      </FxaOwnerRecordActionSheet>
    </div>
  );
};
