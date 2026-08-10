import { IconTrash } from '@tabler/icons-react';
import { AlertDialog, Button, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useReportChartMutations } from '@/report/hooks/useReportCharts';

interface RemoveReportChartButtonProps {
  chartId: string;
  chartName: string;
}

export const RemoveReportChartButton = ({
  chartId,
  chartName,
}: RemoveReportChartButtonProps) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { removeReportChart, removing } = useReportChartMutations();

  const handleRemove = () => {
    removeReportChart({
      variables: { _id: chartId },
      onCompleted: () =>
        toast({ variant: 'success', title: t('chart-deleted') }),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('error'),
          description: error.message,
        }),
    });
  };

  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          title={t('delete-chart')}
        >
          <IconTrash className="size-3.5" />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{t('delete-chart')}</AlertDialog.Title>
          <AlertDialog.Description>
            {t('confirm-delete-chart', { name: chartName })}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
          <AlertDialog.Action onClick={handleRemove} disabled={removing}>
            {t('delete')}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
