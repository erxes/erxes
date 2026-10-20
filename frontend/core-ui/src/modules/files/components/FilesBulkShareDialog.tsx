import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFilesBulkShareForm } from '../hooks/useFilesBulkShareForm';
import { FilesGrantRow } from './FilesGrantRow';

export const FilesBulkShareDialog = () => {
  const { t } = useTranslation('files');
  const dialog = useFilesBulkShareForm();

  return (
    <Dialog open={dialog.open} onOpenChange={(next) => !next && dialog.close()}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>
            {t('bulk-share-title', { count: dialog.count })}
          </Dialog.Title>
          <Dialog.Description>{t('bulk-share-description')}</Dialog.Description>
        </Dialog.Header>
        <Form {...dialog.form}>
          <form onSubmit={dialog.onSubmit} className="flex flex-col gap-4">
            <section className="flex flex-col gap-2">
              {dialog.grants.fields.map((row, index) => (
                <FilesGrantRow
                  key={row.id}
                  control={dialog.form.control}
                  index={index}
                  type={row.type}
                  roles={dialog.roles}
                  onTypeChange={(value) => dialog.changeType(index, value)}
                  onRemove={() => dialog.grants.remove(index)}
                />
              ))}
              <Button
                type="button"
                variant="secondary"
                className="self-start"
                onClick={dialog.addGrant}
              >
                <IconPlus />
                {t('add-grant')}
              </Button>
            </section>
            {dialog.hasFiles && (
              <p className="text-xs text-muted-foreground">
                {t('bulk-share-files-hint')}
              </p>
            )}
            <Dialog.Footer>
              <Button type="button" variant="secondary" onClick={dialog.close}>
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={dialog.saving || !dialog.grants.fields.length}
              >
                {t('share')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
