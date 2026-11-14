import { useBroadcastSelectValue } from '@/broadcast/context/BroadcastSelectValueContext';
import { useFilterContext, useQueryState } from 'erxes-ui';
import { useCallback, useState } from 'react';

type TFilterOption = { value: string; labelKey: string };

/** The option the current value names, if any. */
export const useBroadcastFilterSelectedOption = (labels: TFilterOption[]) => {
  const { value } = useBroadcastSelectValue();

  return labels.find((item) => item.value === value);
};

/** The option list: picking the chosen one again clears it. */
export const useBroadcastFilterOptionList = () => {
  const { value, onValueChange } = useBroadcastSelectValue();

  const toggle = useCallback(
    (optionValue: string) =>
      onValueChange(value === optionValue ? '' : optionValue),
    [value, onValueChange],
  );

  return { value, toggle };
};

/** Inside the filter popover: a pick filters at once and closes the filter. */
export const useBroadcastFilterView = (queryKey: string) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  const select = useCallback(
    (next: string) => {
      setValue(next);
      resetFilterState();
    },
    [setValue, resetFilterState],
  );

  return { value: value ?? undefined, select };
};

/** On the filter bar: a pick filters and closes the bar's own popover. */
export const useBroadcastFilterBar = (queryKey: string) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [open, setOpen] = useState(false);

  const select = useCallback(
    (next: string) => {
      setValue(next);
      setOpen(false);
    },
    [setValue],
  );

  return { value: value ?? undefined, open, setOpen, select };
};
