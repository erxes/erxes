import { useMemo } from 'react';
import {
  TSegmentField,
  TSegmentNode,
  useSegmentDetail,
  useSegmentFields,
} from 'ui-modules';

type ReEnrollmentOption = {
  propertyName: string;
  label: string;
};

/** Every field the tree filters on, wherever it sits in the nesting. */
const collectFieldKeys = (node?: TSegmentNode): string[] => {
  if (!node) {
    return [];
  }

  if (node.kind === 'field') {
    return node.fieldKey ? [node.fieldKey] : [];
  }

  return node.children.flatMap(collectFieldKeys);
};

/**
 * Which properties a re-enrollment rule may watch: whatever the segment
 * actually filters on, labelled the way the segment form labels them.
 */
export const useReEnrollmentRules = ({ contentId }: { contentId: string }) => {
  const { segment, segmentLoading } = useSegmentDetail(contentId);
  const { fields, loading: fieldsLoading } = useSegmentFields(
    segment?.contentType,
  );

  const reEnrollmentOptions = useMemo<ReEnrollmentOption[]>(() => {
    const keys = [...new Set(collectFieldKeys(segment?.root))];

    return keys.map((propertyName) => ({
      propertyName,
      label:
        fields.find((field: TSegmentField) => field.key === propertyName)
          ?.label || propertyName,
    }));
  }, [segment?.root, fields]);

  const getLabelByPropertyName = (propertyName: string) =>
    reEnrollmentOptions.find((option) => option.propertyName === propertyName)
      ?.label || propertyName;

  return {
    reEnrollmentOptions,
    loading: segmentLoading || fieldsLoading,
    getLabelByPropertyName,
    hasSubSegmentConditions: reEnrollmentOptions.length > 0,
  };
};
