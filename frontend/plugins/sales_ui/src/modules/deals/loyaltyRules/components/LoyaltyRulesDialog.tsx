import { IconAlertTriangle, IconCoins, IconPlus } from '@tabler/icons-react';
import { Alert, Button, Dialog, Form, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_RULE_GROUPS } from '../constants';
import { useLoyaltyRuleNotes } from '../hooks/useLoyaltyRuleNotes';
import { useLoyaltyRulesForm } from '../hooks/useLoyaltyRulesForm';
import { LoyaltyRuleRow } from './LoyaltyRuleRow';

// Where deals earn a score campaign's points and where they give them back.
export const LoyaltyRulesDialog = () => {
  const { t } = useTranslation('sales');
  const {
    open,
    setOpen,
    form,
    fields,
    loading,
    error,
    saving,
    add,
    remove,
    submit,
  } = useLoyaltyRulesForm();
  const { overrides, competingAutomations } = useLoyaltyRuleNotes(
    form.control,
    open,
  );

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <IconCoins />
        {t('loyalty-rules-title')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="max-h-[85vh] max-w-6xl overflow-y-auto">
          <Dialog.Header>
            <Dialog.Title>{t('loyalty-rules-title')}</Dialog.Title>
            <Dialog.Description>{t('loyalty-rules-hint')}</Dialog.Description>
          </Dialog.Header>
          <Form {...form}>
            <form
              onSubmit={(event) => {
                // Opened from inside the pipeline form too; keep it out.
                event.stopPropagation();
                submit(event);
              }}
              className="flex flex-col gap-6"
            >
              {loading && <Skeleton className="h-24 w-full" />}
              {error && (
                <p className="text-sm text-destructive">{error.message}</p>
              )}

              {!loading &&
                LOYALTY_RULE_GROUPS.map(
                  ({ type, labelKey, hintKey, icon: Icon }) => (
                    <section key={type} className="flex flex-col">
                      <h3 className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="size-4" />
                        {t(labelKey)}
                      </h3>
                      <p className="mb-1 text-xs text-muted-foreground">
                        {t(hintKey)}
                      </p>
                      {fields.map((field, index) =>
                        field.type === type ? (
                          <LoyaltyRuleRow
                            key={field.key}
                            control={form.control}
                            index={index}
                            type={type}
                            overrides={overrides(index)}
                            onRemove={() => remove(index)}
                          />
                        ) : null,
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        className="self-start"
                        onClick={() => add(type)}
                      >
                        <IconPlus />
                        {t('add')}
                      </Button>
                    </section>
                  ),
                )}

              {competingAutomations.length > 0 && (
                <Alert variant="warning">
                  <IconAlertTriangle />
                  <Alert.Title>
                    {t('loyalty-rules-competing-automations', {
                      names: competingAutomations
                        .map(({ name }) => name || t('untitled'))
                        .join(', '),
                    })}
                  </Alert.Title>
                </Alert>
              )}

              <Dialog.Footer>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={saving || loading}>
                  {t('save')}
                </Button>
              </Dialog.Footer>
            </form>
          </Form>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
