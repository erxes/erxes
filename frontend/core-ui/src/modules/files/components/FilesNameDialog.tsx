import { Button, Dialog, Form, Input, Label, RadioGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFilesNameForm } from '../hooks/useFilesNameForm';

export const FilesNameDialog = () => {
  const { t } = useTranslation('files');
  const {
    form,
    open,
    close,
    title,
    nameError,
    suffix,
    onSubmit,
    loading,
    isCreate,
    tiers,
  } = useFilesNameForm();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>
                  <div className="flex items-center gap-2">
                    <Form.Control>
                      <Input autoFocus {...field} />
                    </Form.Control>
                    {suffix && (
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {suffix}
                      </span>
                    )}
                  </div>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">{nameError}</p>
                  )}
                </Form.Item>
              )}
            />
            {isCreate && (
              <Form.Field
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('who-has-access')}</Form.Label>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      {tiers.map((tier) => (
                        <div key={tier} className="flex items-start gap-2">
                          <RadioGroup.Item
                            value={tier}
                            id={`files-tier-${tier}`}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`files-tier-${tier}`}
                            className="flex flex-col gap-0.5"
                          >
                            <span>{t(`tier-${tier}`)}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {t(`tier-${tier}-description`)}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </Form.Item>
                )}
              />
            )}
            <Dialog.Footer>
              <Button type="button" variant="secondary" onClick={close}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {t('save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
