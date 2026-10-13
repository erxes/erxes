import { SEGMENT_MEMBERSHIP_AUTOMATIONS } from '@/segments/graphql/segmentAutomationsQueries';
import { useQuery } from '@apollo/client';
import { ISegment } from 'ui-modules';

export type TSegmentAutomation = {
  _id: string;
  name?: string;
  status?: string;
};

/** The flows started when a record enters or leaves this segment. */
export const useSegmentAutomations = (segment?: ISegment) => {
  const { data, loading } = useQuery<{ automations: TSegmentAutomation[] }>(
    SEGMENT_MEMBERSHIP_AUTOMATIONS,
    {
      variables: { triggerSegmentId: segment?._id },
      skip: !segment?._id,
      // Automations are edited elsewhere; coming back must show the change.
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    automations: data?.automations || [],
    loading: loading && !data,
  };
};
