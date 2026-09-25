import { Form, Switch } from 'erxes-ui';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';

type Props = {
  form: UseFormReturn<FieldValues>;
};

export const DealConfigForm = ({ form }: Props) => {
  const { t } = useTranslation('payment');

  const enabled = !!form.watch('dealEnabled');
  const boardId: string | undefined = form.watch('dealBoardId');
  const pipelineId: string | undefined = form.watch('dealPipelineId');

  return (
    <>
      <Form.Field
        name="dealEnabled"
        control={form.control}
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Form.Label>{t('create-deal-on-payment')}</Form.Label>
                <Form.Description>
                  {t('create-deal-description')}
                </Form.Description>
              </div>
              <Form.Control>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('dealBoardId', '');
                      form.setValue('dealPipelineId', '');
                      form.setValue('dealStageId', '');
                    }
                  }}
                />
              </Form.Control>
            </div>
          </Form.Item>
        )}
      />

      {enabled && (
        <>
          <Form.Field
            name="dealBoardId"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('board')} *</Form.Label>
                <SelectBoard
                  mode="single"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value as string);
                    form.setValue('dealPipelineId', '');
                    form.setValue('dealStageId', '');
                  }}
                  placeholder={t('select-board')}
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            name="dealPipelineId"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('pipeline')} *</Form.Label>
                <SelectPipeline
                  mode="single"
                  value={field.value}
                  boardId={boardId || undefined}
                  onValueChange={(value) => {
                    field.onChange(value as string);
                    form.setValue('dealStageId', '');
                  }}
                  placeholder={t('select-pipeline')}
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            name="dealStageId"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('stage')} *</Form.Label>
                <SelectStage
                  mode="single"
                  value={field.value}
                  pipelineId={pipelineId || undefined}
                  onValueChange={(value) => field.onChange(value as string)}
                  placeholder={t('select-stage')}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </>
      )}
    </>
  );
};
