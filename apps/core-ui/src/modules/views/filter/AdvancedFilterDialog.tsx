import type { ConditionGroup, ViewRecordType } from '@erxes/core-contract';
import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { ConditionsEditor } from '~/modules/automations/builder/ConditionsEditor';
import { subjectOf, useFilterFields, useListQuery } from '../useViews';

/** Mounted each time the dialog opens, so the draft starts from the list's filter. */
const AdvancedFilterForm = ({
  recordType,
  onDone,
}: {
  recordType: ViewRecordType;
  onDone: () => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const fields = useFilterFields(recordType);
  const { advanced, setAdvanced } = useListQuery();
  const [draft, setDraft] = useState<ConditionGroup | null>(advanced);

  const apply = (next: ConditionGroup | null) => {
    setAdvanced(next);
    onDone();
  };

  return (
    <>
      <QueryState
        query={fields}
        loading={<p className="text-sm text-muted-foreground">{t('loading')}</p>}
      >
        {(data) => (
          <ConditionsEditor
            fields={data}
            subject={subjectOf(recordType)}
            value={draft ?? undefined}
            onChange={(next) => setDraft(next ?? null)}
          />
        )}
      </QueryState>
      <Dialog.Footer className="border-t pt-3">
        <Button variant="ghost" onClick={() => apply(null)}>
          {t('clear')}
        </Button>
        <Button onClick={() => apply(draft)}>{t('apply')}</Button>
      </Dialog.Footer>
    </>
  );
};

/** The full builder (every field, and/or groups), for what the filter menu can't say. */
export const AdvancedFilterDialog = ({
  recordType,
  open,
  onOpenChange,
}: {
  recordType: ViewRecordType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="space-y-3 sm:max-w-3xl">
        <Dialog.HeaderCombined title={t('advanced')} description={t('advanced-title')} />
        <AdvancedFilterForm recordType={recordType} onDone={() => onOpenChange(false)} />
      </Dialog.Content>
    </Dialog>
  );
};
