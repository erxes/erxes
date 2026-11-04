import { IconFileImport } from '@tabler/icons-react';
import { Button, Label, RadioGroup, Sheet, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useSafeRemainderItemsBulkEdit } from '@/inventories/safeRemainders/hooks/useSafeRemainderItemsBulkEdit';
import { useSafeRemainderImport } from '@/inventories/safeRemainders/hooks/useSafeRemainderImport';
import { SafeRemainderImportUpload } from '@/inventories/safeRemainders/components/SafeRemainderImportUpload';

import { SafeRemainderCsvImport } from '@/inventories/safeRemainders/components/SafeRemainderCsvImport';

type DuplicateRule = 'last' | 'skip' | 'add';

const DUPLICATE_RULES: {
  value: DuplicateRule;
  label: string;
  description: string;
}[] = [
  {
    value: 'last',
    label: 'last',
    description: 'use-the-last-value-for-duplicates',
  },
  {
    value: 'skip',
    label: 'skip',
    description: 'keep-the-first-value-for-duplicates',
  },
  {
    value: 'add',
    label: 'add',
    description: 'add-values-for-duplicates',
  },
];

const DuplicateRuleOptions = ({
  value,
  onChange,
}: {
  value: DuplicateRule;
  onChange: (rule: DuplicateRule) => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <RadioGroup
      value={value}
      onValueChange={(rule) => {
        if (rule === 'last' || rule === 'skip' || rule === 'add')
          onChange(rule);
      }}
      className="flex flex-col gap-3"
    >
      {DUPLICATE_RULES.map((rule) => (
        <Label
          key={rule.value}
          className="flex items-start gap-3 cursor-pointer rounded-md border p-3 hover:bg-accent"
        >
          <RadioGroup.Item value={rule.value} className="mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              {t(rule.label, { nsSeparator: false })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(rule.description)}
            </p>
          </div>
        </Label>
      ))}
    </RadioGroup>
  );
};

export const SafeRemainderImport = ({
  safeRemainderId,
}: {
  safeRemainderId: string;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const [duplicateRule, setDuplicateRule] = useState<DuplicateRule>('last');
  const { bulkEditRemItems, loading } = useSafeRemainderItemsBulkEdit();
  const session = useSafeRemainderImport(loading);
  const { format, items, reading, error, clear } = session;

  const handleConfirm = async () => {
    if (!items.length || loading || reading || error) return;
    const result = await bulkEditRemItems(
      safeRemainderId,
      items,
      duplicateRule,
    ).catch(() => undefined);
    if (!result?.data || result.errors?.length) return;
    setOpen(false);
    clear();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (loading) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      clear();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="secondary"
        disabled={loading}
        onClick={() => setOpen(true)}
      >
        <IconFileImport />
        {t('import')}
      </Button>
      <AccountingSheet
        title={t('import-from-file')}
        className={format === 'csv' ? 'sm:max-w-xl' : undefined}
      >
        <div className="flex flex-col flex-1 min-h-0 bg-background">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-5">
            <Tabs value={format} onValueChange={session.changeFormat}>
              <Tabs.List className="w-full">
                <Tabs.Trigger disabled={loading} value="txt" className="flex-1">
                  TXT
                </Tabs.Trigger>
                <Tabs.Trigger disabled={loading} value="csv" className="flex-1">
                  CSV
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="txt" className="space-y-4 pt-4">
                <SafeRemainderImportUpload
                  session={session}
                  disabled={loading}
                />
              </Tabs.Content>
              <Tabs.Content value="csv" className="space-y-4 pt-4">
                {format === 'csv' && (
                  <SafeRemainderCsvImport
                    session={session}
                    disabled={loading}
                  />
                )}
              </Tabs.Content>
            </Tabs>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {items.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">
                  {items.length} {t('rows')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'how-should-rows-with-duplicate-productcode-values-be-handled',
                  )}
                </p>
                <DuplicateRuleOptions
                  value={duplicateRule}
                  onChange={setDuplicateRule}
                />
              </div>
            )}
          </div>
          <Sheet.Footer className="px-5 border-t bg-background shrink-0 mt-4">
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => handleOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || reading || !!error || items.length === 0}
            >
              {t('import-label')}
              {items.length} {t('rows')}
            </Button>
          </Sheet.Footer>
        </div>
      </AccountingSheet>
    </Sheet>
  );
};
