import { zodResolver } from '@hookform/resolvers/zod';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button, Dialog, Form, Input, Spinner, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useReportChartMutations } from '@/report/hooks/useReportCharts';
import { ReportChartFilters, ResponsesChartType } from '@/report/types';

const saveChartSchema = z.object({
  name: z.string().trim().min(1, 'Chart name is required'),
});

type SaveChartForm = z.infer<typeof saveChartSchema>;

interface SaveReportChartButtonProps {
  chartType: string;
  visualType?: ResponsesChartType;
  colSpan: 6 | 12;
  filters: ReportChartFilters;
}

export const SaveReportChartButton = ({
  chartType,
  visualType,
  colSpan,
  filters,
}: SaveReportChartButtonProps) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { addReportChart, adding } = useReportChartMutations();

  const form = useForm<SaveChartForm>({
    resolver: zodResolver(saveChartSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = form.handleSubmit(({ name }) => {
    addReportChart({
      variables: { name: name.trim(), chartType, visualType, colSpan, filters },
      onCompleted: () => {
        toast({ variant: 'success', title: t('chart-saved') });
        form.reset();
        setOpen(false);
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('error'),
          description: error.message,
        }),
    });
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          title={t('save-chart')}
        >
          <IconDeviceFloppy className="size-3.5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Dialog.Header>
              <Dialog.Title>{t('save-chart')}</Dialog.Title>
              <Dialog.Description>
                {t('save-chart-description')}
              </Dialog.Description>
            </Dialog.Header>
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('chart-name')}</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      autoFocus
                      placeholder={t('chart-name-placeholder')}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  {t('cancel')}
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={adding}>
                {adding ? <Spinner /> : t('save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
