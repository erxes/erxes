import type { ConditionGroup } from '@erxes/core-contract';
import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConditionsEditor } from '~/modules/automations/builder/ConditionsEditor';
import { useListQuery } from '../useViews';
import { useListFilter } from './listFilterContext';

/** Mounted each time the dialog opens, so the draft starts from the list's filter. */
const AdvancedFilterForm = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { fields, subject } = useListFilter();
  const { advanced, setAdvanced } = useListQuery();
  const [draft, setDraft] = useState<ConditionGroup | null>(advanced);

  const apply = (next: ConditionGroup | null) => {
    setAdvanced(next);
    onDone();
  };

  return (
    <>
      {/* The bar's menu says when the fields are loading or failed to. */}
      <ConditionsEditor
        fields={fields}
        subject={subject}
        value={draft ?? undefined}
        onChange={(next) => setDraft(next ?? null)}
      />
      <Dialog.Footer>
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
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-3xl">
        <Dialog.HeaderCombined title={t('advanced')} description={t('advanced-title')} />
        <AdvancedFilterForm onDone={() => onOpenChange(false)} />
      </Dialog.Content>
    </Dialog>
  );
};
