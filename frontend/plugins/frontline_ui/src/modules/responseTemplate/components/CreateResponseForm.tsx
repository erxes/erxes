import { Form, Input, ScrollArea, Editor } from 'erxes-ui';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import type { TResponseForm } from '@/responseTemplate/types';
import { useEffect, useState } from 'react';

export interface CreateResponseFormProps {
  type: 'create' | 'update';
  form: UseFormReturn<TResponseForm>;
  onSubmit: (data: TResponseForm) => void;
  loading?: boolean;
  onCancel: () => void;
}

/** Renders response template fields and the create or update form actions. */
export const CreateResponseForm = (props: CreateResponseFormProps) => {
  const { type, form, loading, onCancel, onSubmit } = props;
  const [editorVersion, setEditorVersion] = useState(0);
  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      if (!name) setEditorVersion((version) => version + 1);
    });
    return () => subscription.unsubscribe();
  }, [form]);
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  return (
    <form
      className="flex flex-1 min-h-0 flex-col"
      onSubmit={form.handleSubmit(onSubmit)}
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
                      key={editorVersion}
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
