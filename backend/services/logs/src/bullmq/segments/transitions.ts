import {
  SegmentApplyMembershipResult,
  sendSegmentMembershipToAutomations,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { segmentLog } from './log';

export type SegmentTransitions = NonNullable<
  SegmentApplyMembershipResult['transitions']
>;

// Records who crossed and hands the crossings to automations.
export const publishTransitions = async (
  subdomain: string,
  contentType: string,
  transitions: SegmentTransitions = [],
) => {
  if (!transitions.length) {
    return;
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'recordTransitions',
    method: 'mutation',
    input: { contentType, transitions },
    defaultValue: { written: 0 },
  });

  sendSegmentMembershipToAutomations(subdomain, { contentType, transitions });

  segmentLog('membership moved', {
    joined: transitions.reduce((n, t) => n + t.joined.length, 0),
    left: transitions.reduce((n, t) => n + t.left.length, 0),
  });
};
