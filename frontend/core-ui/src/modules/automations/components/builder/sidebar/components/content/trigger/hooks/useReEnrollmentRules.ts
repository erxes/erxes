import {
  FIELDS_COMBINED_BY_CONTENT_TYPE,
  ISegment,
  useSegmentDetail,
  IField,
} from 'ui-modules';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
type QueryResponse = {
  fieldsCombinedByContentType: IField[];
};

type ReEnrollmentOption = {
  propertyName: string;
  label: string;
};

type SegmentWithSubSegmentConditions = ISegment & {
  subSegmentConditions?: ISegment[];
};

export const useReEnrollmentRules = ({ contentId }: { contentId: string }) => {
  const { segment, segmentLoading } = useSegmentDetail(contentId);
  const segmentWithSubSegments = segment as
    | SegmentWithSubSegmentConditions
    | undefined;
  const { data, loading: fieldsLoading } = useQuery<QueryResponse>(
    FIELDS_COMBINED_BY_CONTENT_TYPE,
    {
      variables: {
        contentType: segment?.contentType,
      },
      skip: !segment?.contentType,
    },
  );

  const fields: IField[] = data?.fieldsCombinedByContentType || [];

  const reEnrollmentOptions = useMemo<ReEnrollmentOption[]>(() => {
    if (
      !segmentWithSubSegments?.subSegmentConditions ||
      !Array.isArray(segmentWithSubSegments.subSegmentConditions)
    ) {
      return [];
    }

    const propertyNameMap = new Map<string, string>();

    for (const subSegment of segmentWithSubSegments.subSegmentConditions) {
      if (!subSegment?.conditions || !Array.isArray(subSegment.conditions)) {
        continue;
      }

      for (const condition of subSegment.conditions) {
        if (condition?.propertyName) {
          if (!propertyNameMap.has(condition.propertyName)) {
            const field = fields.find((f) => f.name === condition.propertyName);
            const label = field?.label || condition.propertyName;
            propertyNameMap.set(condition.propertyName, label);
          }
        }
      }
    }

    return Array.from(propertyNameMap.entries()).map(
      ([propertyName, label]) => ({
        propertyName,
        label,
      }),
    );
  }, [segmentWithSubSegments?.subSegmentConditions, fields]);

  const getLabelByPropertyName = (propertyName: string): string => {
    const option = reEnrollmentOptions.find(
      (opt) => opt.propertyName === propertyName,
    );
    return option?.label || propertyName;
  };

  return {
    reEnrollmentOptions,
    loading: segmentLoading || fieldsLoading,
    getLabelByPropertyName,
    hasSubSegmentConditions: Boolean(
      segmentWithSubSegments?.subSegmentConditions &&
        segmentWithSubSegments.subSegmentConditions.length > 0,
    ),
  };
};
