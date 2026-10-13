import { sendWorkerQueue } from '../../utils/mq-worker';
import { SegmentMembershipTransition } from '../segments/types';

/**
 * A trigger that fires when a record enters or leaves a materialized segment.
 * Its type stays the record's own type, so every action reads the target as
 * usual; the marker and the two exits live in the config.
 */
export const AUTOMATION_SEGMENT_MEMBERSHIP_EVENT = 'segmentMembership';

export const AUTOMATION_SEGMENT_MEMBERSHIP_FOLKS = ['joined', 'left'] as const;

export type TAutomationSegmentMembershipFolk =
  (typeof AUTOMATION_SEGMENT_MEMBERSHIP_FOLKS)[number];

export type TAutomationSegmentMembershipJob = {
  contentType: string;
  transitions: SegmentMembershipTransition[];
};

export const isSegmentMembershipTrigger = (trigger?: {
  config?: Record<string, any>;
}) => trigger?.config?.event === AUTOMATION_SEGMENT_MEMBERSHIP_EVENT;

/** Hands the segment worker's joins and leaves to the automations service. */
export const sendSegmentMembershipToAutomations = (
  subdomain: string,
  data: TAutomationSegmentMembershipJob,
) =>
  sendWorkerQueue('automations', 'segmentMembership')
    .add('segmentMembership', { subdomain, data })
    .catch((error) => {
      console.error('Error adding segment membership job:', error);
    });
