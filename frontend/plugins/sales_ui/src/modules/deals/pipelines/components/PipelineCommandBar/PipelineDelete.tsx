import { IPipeline } from '@/deals/types/pipelines';
import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm } from 'erxes-ui';
import { usePipelinesBulkRemove } from '../../../boards/hooks/usePipelines';
import { useTranslation } from 'react-i18next';

interface PipelineDeleteProps {
  pipelines: IPipeline[];
  rows: any[];
}

export const PipelineDelete = ({ pipelines, rows }: PipelineDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePipelines } = usePipelinesBulkRemove();
  const { t } = useTranslation('sales');

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete the ${
        pipelines.length
      } selected pipeline${pipelines.length !== 1 ? 's' : ''}?`,
    }).then(async () => {
      try {
        await removePipelines(pipelines);
        rows.forEach((row) => {
          row.toggleSelected(false);
        });
      } catch (e: any) {
        console.error('Bulk delete error:', e);
      }
    });
  };

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={handleDelete}
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
