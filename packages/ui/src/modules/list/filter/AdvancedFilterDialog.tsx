import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import type { TConditionGroup } from '../../conditions/conditions';
import { ConditionsEditor } from '../../conditions/ConditionsEditor';
import { useListFilter } from './listFilterContext';
import { useListConditions } from './listFilterQuery';

/** Mounted each time the dialog opens, so the draft starts from the list's filter. */
const AdvancedFilterForm = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { fields, lookups } = useListFilter();
  const { advanced, setAdvanced } = useListConditions();
  const [draft, setDraft] = useState<TConditionGroup | null>(advanced);

  const apply = (next: TConditionGroup | null) => {
    setAdvanced(next);
    onDone();
  };

  return (
    <>
      {/* The bar's menu says when the fields are loading or failed to. */}
      <ConditionsEditor
        fields={fields.map(({ options, ...field }) => ({
          ...field,
          options: options?.map((option) => option.value),
        }))}
        {...lookups}
        value={draft ?? undefined}
        onChange={(next) => setDraft(next ?? null)}
      />
      <Dialog.Footer>
        <Button variant="ghost" onClick={() => apply(null)}>
          {t('clear', 'Clear')}
        </Button>
        <Button onClick={() => apply(draft)}>{t('apply', 'Apply')}</Button>
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
        <Dialog.HeaderCombined
          title={t('advanced', 'Advanced filter')}
          description={t('advanced-title', 'Show records where')}
        />
        <AdvancedFilterForm onDone={() => onOpenChange(false)} />
      </Dialog.Content>
    </Dialog>
  );
};
