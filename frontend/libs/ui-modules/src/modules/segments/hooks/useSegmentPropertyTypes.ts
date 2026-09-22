import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { SEGMENT_RELATIONS, SEGMENTS_GET_TYPES } from '../graphql/queries';
import { TSegmentOperator, TSegmentRelation } from '../types/segmentNode';

type TSegmentType = { contentType: string; description: string };

export type TPropertyType = {
  contentType: string;
  label: string;
  relationKey?: string;
  measureOperators?: TSegmentOperator[];
};

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
