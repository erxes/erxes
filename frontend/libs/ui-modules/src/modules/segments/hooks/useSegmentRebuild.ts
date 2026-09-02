import { ApolloError, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SEGMENT_REBUILD, SEGMENT_STOP_REBUILD } from '../graphql/mutations';

export const useSegmentRebuild = (segmentId?: string) => {
  const [segmentsRebuild, { loading: starting }] = useMutation(SEGMENT_REBUILD);
  const [segmentsStopRebuild, { loading: stopping }] =
    useMutation(SEGMENT_STOP_REBUILD);

  const onError = (title: string) => (error: ApolloError) =>
    toast({ title, description: error.message, variant: 'destructive' });

  const rebuild = () => {
    if (!segmentId) {
      return;
    }

    segmentsRebuild({
      variables: { _id: segmentId },
      onError: onError('Could not start the rebuild'),
      onCompleted: () => toast({ title: 'Rebuild queued' }),
    });
  };

  const stop = () => {
    if (!segmentId) {
      return;
    }

    segmentsStopRebuild({
      variables: { _id: segmentId },
      onError: onError('Could not stop the rebuild'),
      onCompleted: () => toast({ title: 'Stopping after the current page' }),
    });
  };

  return { rebuild, stop, starting, stopping, rebuilding: starting };
};
