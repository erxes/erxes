import { IAutomationsActionFolkConfig } from 'ui-modules';

// Mirrors erxes-api-shared's AUTOMATION_SEGMENT_MEMBERSHIP_EVENT.
export const SEGMENT_MEMBERSHIP_EVENT = 'segmentMembership';

// Labels are translation keys; the node translates them before drawing.
const SEGMENT_MEMBERSHIP_FOLKS: IAutomationsActionFolkConfig[] = [
  { key: 'joined', label: 'segment-membership-joined', type: 'success' },
  { key: 'left', label: 'segment-membership-left', type: 'error' },
];

type TTriggerLike = {
  actionId?: string;
  config?: Record<string, any>;
};

export const isSegmentMembershipTrigger = (config?: Record<string, any>) =>
  config?.event === SEGMENT_MEMBERSHIP_EVENT;

/** A membership trigger has two exits and no plain one. */
export const resolveTriggerFolks = (
  config?: Record<string, any>,
): IAutomationsActionFolkConfig[] =>
  isSegmentMembershipTrigger(config) ? SEGMENT_MEMBERSHIP_FOLKS : [];

/** Every action a trigger starts a run from. */
export const triggerStartActionIds = ({ actionId, config }: TTriggerLike) =>
  [
    actionId,
    ...resolveTriggerFolks(config).map(({ key }) => config?.[key]),
  ].filter((id): id is string => typeof id === 'string' && !!id);
