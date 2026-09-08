import { graphqlPubsub } from 'erxes-api-shared/utils';

export type SegmentBuildEvent = {
  segmentId: string;
  status?: string;
  buildProcessed?: number;
  buildTotal?: number;
  membersCount?: number;
  buildCancelRequested?: boolean;
};

const PROGRESS_INTERVAL_MS = 1000;

const lastProgressAt = new Map<string, number>();

export const publishSegmentBuild = (event: SegmentBuildEvent): void => {
  const isProgress = event.status === 'building';

  if (isProgress) {
    const now = Date.now();

    if (
      now - (lastProgressAt.get(event.segmentId) || 0) <
      PROGRESS_INTERVAL_MS
    ) {
      return;
    }

    lastProgressAt.set(event.segmentId, now);
  } else {
    lastProgressAt.delete(event.segmentId);
  }

  graphqlPubsub.publish('segmentBuildChanged', { segmentBuildChanged: event });
};
