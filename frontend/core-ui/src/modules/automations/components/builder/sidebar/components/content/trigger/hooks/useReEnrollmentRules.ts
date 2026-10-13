import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  SEGMENT_RELATIONS,
  TSegmentField,
  TSegmentMeasure,
  TSegmentNode,
  TSegmentRelation,
  useSegmentDetail,
  useSegmentFields,
} from 'ui-modules';

// Matches the automations service: a rule naming a relation condition by its
// place in the trigger segment's tree.
const RELATION_RULE_PREFIX = 'relation:';

export type ReEnrollmentRelation = {
  label: string;
  relatedType: string;
  measure: TSegmentMeasure;
};

export type ReEnrollmentOption = {
  propertyName: string;
  label: string;
  relation?: ReEnrollmentRelation;
};

type TRelationAt = {
  path: string;
  relationKey: string;
  measure: TSegmentMeasure;
};

/** Every field the tree filters on, wherever it sits in the nesting. */
const collectFieldKeys = (node?: TSegmentNode): string[] => {
  if (!node) {
    return [];
  }

  if (node.kind === 'field') {
    return node.fieldKey ? [node.fieldKey] : [];
  }

  if (node.kind === 'group') {
    return node.children.flatMap(collectFieldKeys);
  }

  // A relation's fields belong to the related record and a referenced
  // segment's to itself; re-enrollment compares only the subject.
  return [];
};

/** The subject's relation conditions (a sum of deals), by tree path. */
const collectRelations = (node?: TSegmentNode, path = ''): TRelationAt[] => {
  if (!node) {
    return [];
  }

  if (node.kind === 'relation') {
    return node.relationKey && node.measure
      ? [{ path, relationKey: node.relationKey, measure: node.measure }]
      : [];
  }

  if (node.kind === 'group') {
    return node.children.flatMap((child, index) =>
      collectRelations(
        child,
        path ? `${path}.children.${index}` : `children.${index}`,
      ),
    );
  }

  return [];
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
  const { data: relationData, loading: relationsLoading } = useQuery<{
    segmentRelations: TSegmentRelation[];
  }>(SEGMENT_RELATIONS, {
    variables: { subjectType: segment?.contentType },
    skip: !segment?.contentType,
  });

  const reEnrollmentOptions = useMemo<ReEnrollmentOption[]>(() => {
    const keys = [...new Set(collectFieldKeys(segment?.root))];
    const relations = relationData?.segmentRelations || [];

    const fieldOptions = keys.map((propertyName) => ({
      propertyName,
      label:
        fields.find((field: TSegmentField) => field.key === propertyName)
          ?.label || propertyName,
    }));

    const relationOptions = collectRelations(segment?.root).map(
      ({ path, relationKey, measure }) => {
        const relation = relations.find(({ key }) => key === relationKey);

        return {
          propertyName: `${RELATION_RULE_PREFIX}${path}`,
          label: relation?.label || relationKey,
          relation: {
            label: relation?.label || relationKey,
            relatedType: relation?.relatedType || '',
            measure,
          },
        };
      },
    );

    return [...fieldOptions, ...relationOptions];
  }, [segment?.root, fields, relationData]);

  return {
    reEnrollmentOptions,
    loading: segmentLoading || fieldsLoading || relationsLoading,
    hasSubSegmentConditions: reEnrollmentOptions.length > 0,
  };
};
