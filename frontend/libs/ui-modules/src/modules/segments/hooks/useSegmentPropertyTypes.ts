import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { SEGMENT_RELATIONS, SEGMENTS_GET_TYPES } from '../graphql/queries';
import { TSegmentOperator, TSegmentRelation } from '../types/segmentNode';

type TSegmentType = { contentType: string; description: string };

export type TPropertyType = {
  /** The related content type, or the subject's own. */
  contentType: string;
  label: string;
  /** Set when this entry is reached through a relation. */
  relationKey?: string;
  measureOperators?: TSegmentOperator[];
};

/**
 * What the first column of a condition offers: the segment's own type, plus
 * the types reachable through a declared relation.
 *
 * Keeping related entities in their own column is what stops the field list
 * from becoming every field of every neighbouring entity at once.
 */
export const useSegmentPropertyTypes = (contentType?: string) => {
  const { data, loading } = useQuery<{ segmentsGetTypes: TSegmentType[] }>(
    SEGMENTS_GET_TYPES,
  );

  const { data: relationData, loading: relationsLoading } = useQuery<{
    segmentRelations: TSegmentRelation[];
  }>(SEGMENT_RELATIONS, {
    variables: { subjectType: contentType },
    skip: !contentType,
  });

  const propertyTypes: TPropertyType[] = useMemo(() => {
    if (!contentType) {
      return [];
    }

    const own = (data?.segmentsGetTypes || []).find(
      (type) => type.contentType === contentType,
    );

    return [
      { contentType, label: own?.description || contentType },
      ...(relationData?.segmentRelations || []).map((relation) => ({
        contentType: relation.relatedType,
        label: relation.label,
        relationKey: relation.key,
        measureOperators: relation.measureOperators,
      })),
    ];
  }, [contentType, data, relationData]);

  const byKey = useCallback(
    (key: string) =>
      propertyTypes.find((type) =>
        type.relationKey ? type.relationKey === key : type.contentType === key,
      ),
    [propertyTypes],
  );

  return { propertyTypes, byKey, loading: loading || relationsLoading };
};
