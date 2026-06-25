import { Form, Input, ScrollArea, Editor, Button } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_RESPONSE_FORM_SCHEMA,
  UPDATE_RESPONSE_FORM_SCHEMA,
  TCreateResponseForm,
  TUpdateResponseForm,
} from '@/settings/schema/response';

interface CreateModeProps {
  type: 'create';
  defaultValues: TCreateResponseForm;
  onSubmit: (data: TCreateResponseForm) => void;
  loading?: boolean;
}

interface UpdateModeProps {
  type: 'update';
  defaultValues: TUpdateResponseForm;
  onSubmit: (data: TUpdateResponseForm) => void;
  loading?: boolean;
}

export type CreateResponseFormProps = CreateModeProps | UpdateModeProps;

export const CreateResponseForm = ({
  type,
  defaultValues,
  onSubmit,
  loading,
}: CreateResponseFormProps) => {
  const { t } = useTranslation('frontline');
  const schema =
    type === 'create'
      ? CREATE_RESPONSE_FORM_SCHEMA
      : UPDATE_RESPONSE_FORM_SCHEMA;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (data: any) => {
    if (type === 'create') {
      onSubmit(data as TCreateResponseForm);
    } else {
      onSubmit(data as TUpdateResponseForm);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Form {...form}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <Form.Field
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name-label')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="content"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('content-label')}</Form.Label>
                  <ScrollArea className="border rounded-md p-2 h-[400px] overflow-y-auto">
                    <Editor
                      initialContent={field.value}
                      onChange={field.onChange}
                      className="min-h-[360px]"
                    />
                  </ScrollArea>
                  <input type="hidden" {...field} />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <span className="flex justify-end">
            <Button type="submit" disabled={!form.formState.isDirty || loading}>
              {type === 'create' ? t('create') : t('update')}
            </Button>
          </span>
        </div>
      </Form>
    </form>
  );
};
