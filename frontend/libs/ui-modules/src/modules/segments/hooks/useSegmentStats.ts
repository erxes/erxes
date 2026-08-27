import { useLazyQuery } from '@apollo/client';
import { toast } from 'erxes-ui/hooks';
import { useState } from 'react';
import { useSegment } from '../context/SegmentProvider';
import { SEGMENTS_PREVIEW_COUNT } from '../graphql/queries';

type TStats = {
  count: number;
  /** Parts of the tree the count could not cover, so it is narrower. */
  unsupported?: string[];
};

/** How many records the tree currently in the form would match. */
export const useSegmentStats = () => {
  const { contentType, form } = useSegment();
  const [stats, setStats] = useState<TStats>();

  const [previewCount, { called, loading }] = useLazyQuery(
    SEGMENTS_PREVIEW_COUNT,
  );

  const handleCalculateStats = async () => {
    const { data } = await previewCount({
      // The form holds the stored shape, so the tree is sent as it is.
      variables: { contentType, root: form.getValues('root') },
      onError: (error) =>
        toast({
          title: 'Could not count the segment',
          description: error.message,
          variant: 'destructive',
        }),
    });

    if (data?.segmentsPreviewCount) {
      setStats(data.segmentsPreviewCount);
    }
  };

  return { handleCalculateStats, stats, loading: called && loading };
};
