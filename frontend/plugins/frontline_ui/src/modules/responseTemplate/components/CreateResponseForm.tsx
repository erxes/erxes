import { Form, Input, ScrollArea, Editor } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RESPONSE_FORM_BASE_SCHEMA,
  TCreateResponseForm,
  TUpdateResponseForm,
} from '@/settings/schema/response';

interface CreateModeProps {
  type: 'create';
  defaultValues: TCreateResponseForm;
  onSubmit: (data: TCreateResponseForm) => void;
  loading?: boolean;
  onCancel: () => void;
}

interface UpdateModeProps {
  type: 'update';
  defaultValues: TUpdateResponseForm;
  onSubmit: (data: TUpdateResponseForm) => void;
  loading?: boolean;
  onCancel: () => void;
}

export type CreateResponseFormProps = CreateModeProps | UpdateModeProps;

export const CreateResponseForm = (props: CreateResponseFormProps) => {
  const { type, defaultValues, loading, onCancel } = props;
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const form = useForm<z.infer<typeof RESPONSE_FORM_BASE_SCHEMA>>({
    resolver: zodResolver(RESPONSE_FORM_BASE_SCHEMA),
    defaultValues: { name: defaultValues.name, content: defaultValues.content },
  });
  const handleSubmit = (data: z.infer<typeof RESPONSE_FORM_BASE_SCHEMA>) => {
    if (props.type === 'create')
      props.onSubmit({ ...data, channelId: props.defaultValues.channelId });
    else props.onSubmit({ ...data, _id: props.defaultValues._id });
  };

  return (
    <form
      className="flex flex-1 min-h-0 flex-col"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Form {...form}>
        <div className="flex flex-1 min-h-0 flex-col gap-2">
          <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto p-4">
            <Form.Field
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name-label', 'Name')}</Form.Label>
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
                  <Form.Label>{t('content-label', 'Content')}</Form.Label>
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

          <SettingsPanelFooter
            onCancel={onCancel}
            cancelLabel={t('cancel', 'Cancel')}
            submitLabel={
              type === 'create' ? t('create', 'Create') : t('update', 'Update')
            }
            loading={loading}
            disabled={!form.formState.isDirty}
          />
        </div>
      </Form>
    </form>
  );
};
