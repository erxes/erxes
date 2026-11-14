import { useFilterContext, useQueryState } from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { ISegment } from '../types';
import { useSelectSegments } from './useSelectSegments';

type TSegmentOption = {
  segment: ISegment;
  checked: boolean;
  toggle: () => void;
};

const toggled = (selected: string[], id: string) =>
  selected.includes(id)
    ? selected.filter((current) => current !== id)
    : [...selected, id];

export const segmentsPageHref = (contentType: string) =>
  `/segments?contentType=${encodeURIComponent(contentType)}`;

/** The segments query param: an empty choice clears it from the URL. */
const useSegmentsParam = () => {
  const [segments, setSegments] = useQueryState<string[]>('segments');

  const setSelected = useCallback(
    (ids: string[]) => setSegments(ids.length ? ids : null),
    [setSegments],
  );

  return { selected: segments || [], setSelected };
};

/** A searchable list of the type's segments, each toggled in or out. */
export const useSegmentsFilterList = ({
  contentType,
  selected,
  onSelect,
}: {
  contentType: string;
  selected: string[];
  onSelect: (ids: string[]) => void;
}) => {
  const list = useSelectSegments({ contentType, focusOnMount: true });

  const segmentOptions: TSegmentOption[] = list.segments.map(
    (segment: ISegment) => ({
      segment,
      checked: selected.includes(segment._id),
      toggle: () => onSelect(toggled(selected, segment._id)),
    }),
  );

  return { ...list, segmentOptions, allHref: segmentsPageHref(contentType) };
};

/** The filter view: picking segments filters at once and closes the filter. */
export const useSegmentsFilterView = () => {
  const { selected, setSelected } = useSegmentsParam();
  const { resetFilterState } = useFilterContext();

  const onSelect = useCallback(
    (ids: string[]) => {
      setSelected(ids);
      resetFilterState();
    },
    [setSelected, resetFilterState],
  );

  return { selected, onSelect };
};

/** The chosen segments' names; an id stands in until its name loads. */
export const useSelectedSegmentNames = (
  contentType: string,
  selected: string[],
) => {
  const { segments } = useSelectSegments({ contentType });

  const names = useMemo(
    () =>
      selected.map(
        (id) =>
          segments.find((segment: ISegment) => segment._id === id)?.name || id,
      ),
    [selected, segments],
  );

  return { firstName: names[0], moreCount: names.length - 1 };
};

/** The bar item: the chosen segments, editing them, and the first one's page. */
export const useSegmentsFilterBar = (contentType: string) => {
  const { selected, setSelected } = useSegmentsParam();
  const [open, setOpen] = useState(false);

  return {
    selected,
    setSelected,
    open,
    setOpen,
    hasSelection: selected.length > 0,
    settingsHref: `${segmentsPageHref(
      contentType,
    )}&segmentId=${encodeURIComponent(selected[0] || '')}&tab=definition`,
  };
};
