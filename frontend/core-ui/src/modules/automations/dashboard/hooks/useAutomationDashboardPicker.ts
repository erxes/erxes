import { useAutomationDashboardList } from '@/automations/dashboard/hooks/useAutomationDashboardList';
import { useAutomationSearchList } from '@/automations/hooks/useAutomationSearchList';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Picking automations for a dashboard widget: with `max` 1 a pick replaces the
 * current one and closes; otherwise picks add up until the widget is full.
 */
export const useAutomationDashboardPicker = ({
  value,
  onChange,
  max,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  max: number;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const searchList = useAutomationSearchList(open);
  const { automations: selected } = useAutomationDashboardList(value);

  const isSingle = max === 1;
  const isFull = max > 1 && value.length >= max;

  const toggle = useCallback(
    (id: string) => {
      if (value.includes(id)) {
        onChange(value.filter((current) => current !== id));
        return;
      }

      if (isSingle) {
        onChange([id]);
        setOpen(false);
        return;
      }

      if (!isFull) {
        onChange([...value, id]);
      }
    },
    [value, onChange, isSingle, isFull],
  );

  const triggerLabelOf = () => {
    if (!value.length) {
      return t('dashboard-pick-automation');
    }

    if (isSingle) {
      return selected[0]?.name || t('dashboard-automation-unavailable');
    }

    return t('dashboard-selected-count', { count: value.length, max });
  };

  const options = searchList.automations.map((automation) => {
    const checked = value.includes(automation._id);

    return { automation, checked, disabled: !checked && isFull };
  });

  return {
    ...searchList,
    open,
    setOpen,
    options,
    selected,
    showSelected: !isSingle && !!selected.length,
    triggerLabel: triggerLabelOf(),
    toggle,
  };
};
