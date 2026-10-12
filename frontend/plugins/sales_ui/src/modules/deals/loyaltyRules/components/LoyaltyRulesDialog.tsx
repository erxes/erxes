import { IconAlertTriangle, IconCoins, IconPlus } from '@tabler/icons-react';
import { Alert, Button, Dialog, Form, Skeleton, Tabs } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LOYALTY_RULE_GROUPS, TLoyaltyRuleType } from '../constants';
import { useLoyaltyRuleNotes } from '../hooks/useLoyaltyRuleNotes';
import {
  TLoyaltyRulesTab,
  useLoyaltyRulesDialog,
} from '../hooks/useLoyaltyRulesDialog';
import { LoyaltyRuleRow } from './LoyaltyRuleRow';
import { LoyaltyTierRuleRow } from './LoyaltyTierRuleRow';

// Widest first; each group's rows override the groups above for their key.
const RuleGroups = ({
  renderRows,
  onAdd,
}: {
  renderRows: (type: TLoyaltyRuleType) => ReactNode;
  onAdd: (type: TLoyaltyRuleType) => void;
}) => {
  const { t } = useTranslation('sales');

  return (
    <>
      {LOYALTY_RULE_GROUPS.map(({ type, labelKey, hintKey, icon: Icon }) => (
        <section key={type} className="flex flex-col">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Icon className="size-4" />
            {t(labelKey)}
          </h3>
          <p className="mb-1 text-xs text-muted-foreground">{t(hintKey)}</p>
          {renderRows(type)}
          <Button
            type="button"
            variant="ghost"
            className="self-start"
            onClick={() => onAdd(type)}
          >
            <IconPlus />
            {t('add')}
          </Button>
        </section>
      ))}
    </>
  );
};

// Where deals earn a score campaign's points, give them back, and set a tier.
export const LoyaltyRulesDialog = () => {
  const { t } = useTranslation('sales');
  const {
    open,
    setOpen,
    tab,
    setTab,
    tierEnabled,
    points,
    tier,
    loading,
    saving,
    submit,
  } = useLoyaltyRulesDialog();
  const { overrides, competingAutomations } = useLoyaltyRuleNotes(
    points.form.control,
    open,
  );

  const pointsContent = (
    <Form {...points.form}>
      <div className="flex flex-col gap-6">
        <RuleGroups
          onAdd={points.add}
          renderRows={(type) =>
            points.fields.map((field, index) =>
              field.type === type ? (
                <LoyaltyRuleRow
                  key={field.key}
                  control={points.form.control}
                  index={index}
                  type={type}
                  overrides={overrides(index)}
                  onRemove={() => points.remove(index)}
                />
              ) : null,
            )
          }
        />
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
      </div>
    </Form>
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
          <form
            onSubmit={(event) => {
              // Opened from inside the pipeline form too; keep it out.
              event.preventDefault();
              event.stopPropagation();
              submit();
            }}
            className="flex flex-col gap-6"
          >
            {loading && <Skeleton className="h-24 w-full" />}
            {(points.error || tier.error) && (
              <p className="text-sm text-destructive">
                {(points.error || tier.error)?.message}
              </p>
            )}

            {!loading &&
              (tierEnabled ? (
                <Tabs
                  value={tab}
                  onValueChange={(value) => setTab(value as TLoyaltyRulesTab)}
                >
                  <Tabs.List>
                    <Tabs.Trigger value="points">
                      {t('loyalty-rules-points-tab')}
                    </Tabs.Trigger>
                    <Tabs.Trigger value="tier">
                      {t('loyalty-rules-tier-tab')}
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="points" className="pt-4">
                    {pointsContent}
                  </Tabs.Content>
                  <Tabs.Content value="tier" className="pt-4">
                    <Form {...tier.form}>
                      <div className="flex flex-col gap-6">
                        <p className="text-xs text-muted-foreground">
                          {t('loyalty-tier-rules-hint')}
                        </p>
                        <RuleGroups
                          onAdd={tier.add}
                          renderRows={(type) =>
                            tier.fields.map((field, index) =>
                              field.type === type ? (
                                <LoyaltyTierRuleRow
                                  key={field.key}
                                  control={tier.form.control}
                                  index={index}
                                  type={type}
                                  onRemove={() => tier.remove(index)}
                                />
                              ) : null,
                            )
                          }
                        />
                      </div>
                    </Form>
                  </Tabs.Content>
                </Tabs>
              ) : (
                pointsContent
              ))}

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
        </Dialog.Content>
      </Dialog>
    </>
  );
};
