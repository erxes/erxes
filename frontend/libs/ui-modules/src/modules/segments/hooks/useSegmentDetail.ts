import { useApolloClient, useQuery, useSubscription } from '@apollo/client';
import { SEGMENT_DETAIL } from 'ui-modules/modules/segments/graphql/queries';
import { SEGMENT_BUILD_CHANGED } from 'ui-modules/modules/segments/graphql/subscriptions';
import { ISegment } from 'ui-modules/modules/segments/types';

type BuildEvent = {
  segmentId: string;
  status?: ISegment['status'];
  buildProcessed?: number;
  buildTotal?: number;
  buildCancelRequested?: boolean;
  membersCount?: number;
};

export const useSegmentDetail = (segmentId?: string) => {
  const client = useApolloClient();

  const {
    data,
    loading: segmentLoading,
    refetch,
  } = useQuery<{ segmentDetail: ISegment }>(SEGMENT_DETAIL, {
    variables: { _id: segmentId },
    skip: !segmentId,
  });

  useSubscription<{ segmentBuildChanged: BuildEvent }>(SEGMENT_BUILD_CHANGED, {
    variables: { segmentId },
    skip: !segmentId,
    onData: ({ data: result }) => {
      const event = result.data?.segmentBuildChanged;

      if (!event) {
        return;
      }

      client.cache.modify({
        id: client.cache.identify({
          __typename: 'Segment',
          _id: event.segmentId,
        }),
        fields: {
          status: (previous) => event.status ?? previous,
          buildProcessed: (previous) => event.buildProcessed ?? previous,
          buildTotal: (previous) => event.buildTotal ?? previous,
          buildCancelRequested: (previous) =>
            event.buildCancelRequested ?? previous,
          membersCount: (previous) => event.membersCount ?? previous,
        },
      });
    },
  });

  const segment = segmentId ? data?.segmentDetail : undefined;

  return {
    segment,
    segmentLoading,
    unavailable: Boolean(segmentId) && !segmentLoading && !segment,
    refetch,
  };
};
