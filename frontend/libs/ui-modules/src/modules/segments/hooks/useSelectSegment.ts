import { useCallback } from 'react';
import { ISegment } from '../types';
import { useSelectSegments } from './useSelectSegments';

type TSelectSegmentValue = string | string[] | null;

const toIds = (selected?: string | string[]) => {
  if (Array.isArray(selected)) {
    return selected;
  }

  return selected ? [selected] : [];
};

const toggled = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id];

/**
 * The segment picker: one segment, or several toggled in and out. The
 * trigger shows the single pick, or the first of many with a count.
 */
export const useSelectSegment = ({
  selected,
  onSelect,
  mode,
  exclude,
  focusOnMount,
  contentType,
  unnamedLabel,
}: {
  selected?: string | string[];
  onSelect: (value: TSelectSegmentValue) => void;
  mode: 'single' | 'multiple';
  exclude?: string[];
  focusOnMount?: boolean;
  contentType?: string;
  unnamedLabel: string;
}) => {
  const selectedIds = toIds(selected);
  const isMultiple = mode === 'multiple';
  const list = useSelectSegments({
    selected: selectedIds[0],
    exclude,
    focusOnMount,
    contentType,
  });
  const { segments, selectedSegment } = list;

  const selectedSegments = isMultiple
    ? selectedIds
        .map((id) => segments.find((segment: ISegment) => segment._id === id))
        .filter((segment): segment is ISegment => !!segment)
    : [];

  const handleSelect = useCallback(
    (segmentId: string | null) => {
      if (!isMultiple) {
        onSelect(segmentId);
        return;
      }

      onSelect(segmentId ? toggled(selectedIds, segmentId) : []);
    },
    [isMultiple, onSelect, selectedIds],
  );

  const triggerKindOf = () => {
    if (isMultiple && selectedSegments.length) {
      return 'multiple';
    }

    return selectedSegment ? 'single' : 'empty';
  };

  return {
    ...list,
    triggerKind: triggerKindOf(),
    firstSelectedName: selectedSegments[0]?.name || unnamedLabel,
    moreSelectedCount: selectedSegments.length - 1,
    isChecked: (segmentId: string) => selectedIds.includes(segmentId),
    nameOf: (segment: ISegment) => segment.name || unnamedLabel,
    handleSelect,
  };
};
