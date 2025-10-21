import { useLazyQuery } from '@apollo/client';
import { useState } from 'react';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { SEGMENTS_PREVIEW_COUNT } from 'ui-modules/modules/segments/graphql/queries';
import { generateParamsSegmentPreviewCount } from 'ui-modules/modules/segments/utils/segmentFormUtils';

type StatsType = {
  total?: number;
  targeted?: number;
  percentage?: number;
  loading?: boolean;
};
export const useSegmentStats = () => {
  const { contentType, form } = useSegment();
  const [stats, setStats] = useState<StatsType>();
  const [countSegment, { called, loading }] = useLazyQuery(
    SEGMENTS_PREVIEW_COUNT,
  );

  const handleCalculateStats = async () => {
    const { data } = await countSegment({
      query: SEGMENTS_PREVIEW_COUNT,
      variables: {
        contentType,
        conditions: generateParamsSegmentPreviewCount(form, contentType || ''),
        subOf: form.getValues('subOf'),
        config: form.getValues('config'),
        conditionsConjunction: form.getValues('conditionsConjunction'),
      },
    });

    const { count = 0, total = 0 } = data?.segmentsPreviewCount || {};
    setStats({
      total,
      targeted: count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
    });
  };

  return {
    handleCalculateStats,
    stats,
    loading: called && loading,
  };
};
