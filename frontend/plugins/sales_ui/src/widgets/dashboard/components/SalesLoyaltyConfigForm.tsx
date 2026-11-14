import { Button, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  SelectBoard,
  SelectPipeline,
  TDashboardWidgetConfig,
} from 'ui-modules';
import { LoyaltyIntervalToggle } from '@/loyalty-points/components/LoyaltyTimelineSections';
import { useSalesLoyaltyConfigForm } from '../hooks/useSalesLoyaltyConfigForm';

/** Which pipelines a loyalty tile sums, and for timelines, by what period. */
export const SalesLoyaltyConfigForm = ({
  config,
  withInterval,
  onSubmit,
  onCancel,
}: {
  config?: TDashboardWidgetConfig | null;
  withInterval: boolean;
  onSubmit: (config: TDashboardWidgetConfig) => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('sales');
  const { form, boardId, changeBoard, changePipelines, clearBoard, submit } =
    useSalesLoyaltyConfigForm(config, onSubmit);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Form.Field
          control={form.control}
          name="boardId"
          render={({ field }) => (
            <Form.Item>
              <div className="flex items-center justify-between gap-2">
                <Form.Label>{t('board', 'Board')}</Form.Label>
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearBoard}
                  >
                    {t('dashboard-loyalty-all-boards', 'All boards')}
                  </Button>
                )}
              </div>
              <SelectBoard.FormItem
                mode="single"
                value={field.value || ''}
                onValueChange={changeBoard}
                placeholder={t('dashboard-loyalty-all-boards', 'All boards')}
              />
              <Form.Description>
                {t(
                  'dashboard-loyalty-scope-hint',
                  'Leave empty to sum every pipeline you can see',
                )}
              </Form.Description>
            </Form.Item>
          )}
        />
        {boardId && (
          <Form.Field
            control={form.control}
            name="pipelineIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('pipelines', 'Pipelines')}</Form.Label>
                <SelectPipeline.FormItem
                  mode="multiple"
                  value={field.value}
                  onValueChange={changePipelines}
                  boardId={boardId}
                />
                <Form.Message className="text-destructive" />
              </Form.Item>
            )}
          />
        )}
        {withInterval && (
          <Form.Field
            control={form.control}
            name="interval"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('dashboard-loyalty-period', 'Period')}
                </Form.Label>
                <LoyaltyIntervalToggle
                  interval={field.value}
                  changeInterval={field.onChange}
                />
              </Form.Item>
            )}
          />
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit">
            {t('dashboard-loyalty-save', 'Save widget')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
