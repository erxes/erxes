import { usePos, usePosByIds } from '@/pos/orders/hooks/useSelectPos';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TEMPLATE_REQUIREMENT_CARD_LIMIT,
  useTemplateRequirementOptions,
} from 'ui-modules';

/**
 * The POS to make orders in: a few shown as cards, more as a picker, a new
 * one made in a sheet beside the wizard and picked. The chosen one's name
 * is told to the wizard once it is known.
 */
export const usePosTemplateRequirement = (
  value: unknown,
  onChange: (value: unknown) => void,
  onLabel?: (label: string | null) => void,
) => {
  const posId = typeof value === 'string' ? value : '';
  const { posList, loading } = usePos({});
  const { posDetail, loading: loadingDetail } = usePosByIds({
    variables: { _id: posId },
    skip: !posId,
  });
  const [isCreating, setCreating] = useState(false);
  const label = (posId && posDetail?.name) || null;

  const select = useCallback(
    (next?: string) => onChange(next || null),
    [onChange],
  );
  const options = useMemo(
    () =>
      posList.map((pos) => ({
        value: pos._id,
        label: pos.name || '',
        description: pos.branchTitle || pos.description || undefined,
      })),
    [posList],
  );

  useTemplateRequirementOptions({
    ids: options.map((option) => option.value),
    value: posId,
    loading,
    onSelect: select,
  });

  useEffect(() => {
    if (!loadingDetail) {
      onLabel?.(label);
    }
  }, [loadingDetail, label, onLabel]);

  return {
    posId,
    options,
    loading,
    showCards: options.length <= TEMPLATE_REQUIREMENT_CARD_LIMIT,
    isCreating,
    setCreating,
    select,
  };
};
