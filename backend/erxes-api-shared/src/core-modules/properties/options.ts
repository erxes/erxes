import { SegmentNode } from '../segments/nodes';
import { walkSegmentNodes } from '../segments/walkNodes';
import { parsePropertyDataKey, PROPERTIES_DATA } from './keys';
import { IPropertyValueCounts } from './valueUsage';

type TOption = { value: string; deprecated?: boolean | null };

// An option a record still holds is archived; one nobody chose simply goes.
export const reconcilePropertyOptions = <T extends TOption>(
  stored: T[] = [],
  incoming: T[] = [],
  // null when it could not be counted; every dropped option is then kept.
  byOption: IPropertyValueCounts['byOption'],
): T[] => {
  const incomingValues = new Set(incoming.map(({ value }) => value));
  const heldValues = new Set(
    (byOption || []).filter(({ count }) => count > 0).map(({ value }) => value),
  );

  const archived = stored
    .filter(({ value }) => !incomingValues.has(value))
    .filter(({ value }) => !byOption || heldValues.has(value))
    .map((option) => ({ ...option, deprecated: true }));

  return [...incoming, ...archived];
};

const PREFIX = `${PROPERTIES_DATA}.`;

// Whether a segment's conditions name one option of a property, at any depth
// and on a plain field or a repeating group's row alike.
export const segmentFiltersByOption = (
  root: SegmentNode | null | undefined,
  fieldId: string,
  value: string,
) => {
  if (!root) {
    return false;
  }

  for (const node of walkSegmentNodes(root)) {
    if (node.kind !== 'field' || !node.fieldKey.startsWith(PREFIX)) {
      continue;
    }

    const key = parsePropertyDataKey(node.fieldKey.slice(PREFIX.length));
    const values = Array.isArray(node.value) ? node.value : [node.value];

    if (key.fieldId === fieldId && values.map(String).includes(value)) {
      return true;
    }
  }

  return false;
};
