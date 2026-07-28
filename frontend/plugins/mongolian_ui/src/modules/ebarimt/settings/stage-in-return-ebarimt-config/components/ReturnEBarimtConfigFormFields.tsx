import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { TReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';

export const ReturnEBarimtConfigFormFields = ({
  form,
  onSubmit,
  formId,
  onBoardChange,
  onPipelineChange,
}: {
  form: UseFormReturn<TReturnEbarimtConfig>;
  onSubmit: (data: TReturnEbarimtConfig) => void;
  formId: string;
  onBoardChange: (value: string | string[]) => void;
  onPipelineChange: (value: string | string[]) => void;
}) => {
  const { t } = useTranslation('mongolian');
  const selectedBoardId = form.watch('destinationStageBoard');
  const selectedPipelineId = form.watch('pipelineId');

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Form.Field
          name="title"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder={t('title')} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <Form.Field
            control={form.control}
            name="destinationStageBoard"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('destination-stage-board')}</Form.Label>
                <SelectBoard.FormItem
                  value={field.value}
                  onValueChange={onBoardChange}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="pipelineId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('pipeline')}</Form.Label>
                <SelectPipeline.FormItem
                  value={field.value}
                  boardId={selectedBoardId}
                  onValueChange={onPipelineChange}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="stageId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('stage')}</Form.Label>
                <SelectStage.FormItem
                  value={field.value}
                  pipelineId={selectedPipelineId}
                  onValueChange={(v) => field.onChange(Array.isArray(v) ? v[0] : v)}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
