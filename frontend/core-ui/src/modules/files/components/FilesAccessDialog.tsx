import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog, Form, Label, Spinner, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFilesAccessForm } from '../hooks/useFilesAccessForm';
import { FilesGrantRow } from './FilesGrantRow';
import { FilesPrincipalName } from './FilesPrincipalName';

export const FilesAccessDialog = () => {
  const { t } = useTranslation('files');
  const dialog = useFilesAccessForm();

  return (
    <Dialog open={dialog.open} onOpenChange={(next) => !next && dialog.close()}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>
            {t('access-title', { name: dialog.item?.name || '' })}
          </Dialog.Title>
          <Dialog.Description>
            {t(
              dialog.isFile ? 'file-access-description' : 'access-description',
            )}
          </Dialog.Description>
        </Dialog.Header>

        {dialog.loading && (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        )}

        {dialog.error && (
          <div className="text-sm text-destructive">{dialog.error.message}</div>
        )}

        {dialog.forbidden && (
          <div className="text-sm text-muted-foreground">
            {t('access-forbidden')}
          </div>
        )}

        {dialog.item && !dialog.forbidden && (
          <Form {...dialog.form}>
            <form onSubmit={dialog.onSubmit} className="flex flex-col gap-4">
              {dialog.canRestrict && (
                <Form.Field
                  control={dialog.form.control}
                  name="restricted"
                  render={({ field }) => (
                    <Form.Item className="flex items-start gap-3">
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                      <div className="flex flex-col gap-0.5">
                        <Form.Label>{t('restricted')}</Form.Label>
                        <span className="text-xs text-muted-foreground">
                          {t('restricted-description')}
                        </span>
                      </div>
                    </Form.Item>
                  )}
                />
              )}

              {!!dialog.inherited.length && (
                <section className="flex flex-col gap-2">
                  <Label>
                    {t(
                      dialog.isFile
                        ? 'file-inherited-access'
                        : 'inherited-access',
                    )}
                  </Label>
                  <div className="flex flex-col divide-y rounded border">
                    {dialog.inherited.map((grant) => (
                      <div
                        key={`${grant.type}:${grant.id || ''}`}
                        className="flex items-center gap-3 px-3 py-2 text-sm"
                      >
                        <span className="w-28 shrink-0 text-muted-foreground">
                          {t(`principal-${grant.type}`)}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          <FilesPrincipalName grant={grant} />
                        </span>
                        <span className="text-muted-foreground">
                          {t(`role-${grant.role}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="flex flex-col gap-2">
                <Label>
                  {t(dialog.isFile ? 'file-access' : 'folder-access')}
                </Label>
                {dialog.ownerId && (
                  <div className="flex items-center gap-3 rounded border px-3 py-2 text-sm">
                    <span className="w-28 shrink-0 text-muted-foreground">
                      {t('owner')}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <FilesPrincipalName
                        grant={{
                          type: 'user',
                          id: dialog.ownerId,
                          role: 'manager',
                        }}
                      />
                    </span>
                    <span className="text-muted-foreground">
                      {t('role-manager')}
                    </span>
                  </div>
                )}
                {!dialog.ownerId && !dialog.grants.fields.length && (
                  <div className="rounded border px-3 py-4 text-center text-sm text-muted-foreground">
                    {t('no-grants')}
                  </div>
                )}
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

              <p className="text-xs text-muted-foreground">{t('roles-hint')}</p>

              <Dialog.Footer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={dialog.close}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={dialog.saving}>
                  {t('save')}
                </Button>
              </Dialog.Footer>
            </form>
          </Form>
        )}
      </Dialog.Content>
    </Dialog>
  );
};
