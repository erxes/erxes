import { Form, Input, Textarea } from 'erxes-ui';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { TCreatePipelineForm, TUpdatePipelineForm } from '@/pipelines/types';
import { useTranslation } from 'react-i18next';

type PipelineFormValues = TCreatePipelineForm | TUpdatePipelineForm;

type CreatePipelineFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
};

const PIPELINE_NAME_FIELD = 'name' as FieldPath<PipelineFormValues>;
const PIPELINE_DESCRIPTION_FIELD =
  'description' as FieldPath<PipelineFormValues>;

export const CreatePipelineForm = <T extends PipelineFormValues>({
  form,
}: CreatePipelineFormProps<T>) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name={PIPELINE_NAME_FIELD as FieldPath<T>}
        render={({ field }) => (
          <Form.Item className="space-y-1">
            <Form.Label>{t('pipeline-name')}</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={PIPELINE_DESCRIPTION_FIELD as FieldPath<T>}
        render={({ field }) => (
          <Form.Item className="space-y-1">
            <Form.Label>{t('description')}</Form.Label>
            <Form.Control>
              <Textarea className="min-h-20 resize-none" {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
