import { useAutomationFolderForm } from '@/automations/hooks/useAutomationFolderForm';
import { IAutomationFolder } from '@/automations/types';
import { Button, Dialog, Form, Input, Spinner } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const AutomationFolderFormDialog = ({
  open,
  onOpenChange,
  folder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: IAutomationFolder;
}) => {
  const { t } = useTranslation('automations');
  const { form, submit, saving } = useAutomationFolderForm({
    folder,
    open,
    onDone: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={folder ? t('folder-rename') : t('folder-new')}
          description={t('folder-form-description')}
        />
        <FormProvider {...form}>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('folder-name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} autoFocus />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Spinner size="sm" />}
                {folder ? t('save') : t('folder-create')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </Dialog.Content>
    </Dialog>
  );
};
