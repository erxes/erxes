import {
  IconCalculator,
  IconEdit,
  IconPlayerPlay,
  IconTrashX,
} from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AdjustRateDetailHeader = ({
  title,
  calculateLoading,
  runLoading,
  removeLoading,
  onCalculate,
  onRun,
  onEdit,
  onDelete,
}: {
  title: string;
  calculateLoading: boolean;
  runLoading: boolean;
  removeLoading: boolean;
  onCalculate: () => void;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={onCalculate} disabled={calculateLoading}>
          {calculateLoading ? <Spinner /> : <IconCalculator size={16} />}
          {t('Calculate')}
        </Button>
        <Button onClick={onRun} disabled={runLoading}>
          {runLoading ? <Spinner /> : <IconPlayerPlay size={16} />}
          {t('run')}
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <IconEdit size={16} />
          {t('edit')}
        </Button>
        <Button
          variant="outline"
          className="text-destructive"
          onClick={onDelete}
          disabled={removeLoading}
        >
          <IconTrashX size={16} />
          {t('delete')}
        </Button>
      </div>
    </div>
  );
};
