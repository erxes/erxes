import {
  AUTOMATION_ERROR_CODES,
  evaluateSegmentBatch,
  SegmentNode,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { debugError } from '../debugger';
import { AutomationActionError } from '../executions/errorCodes';
import { automationSegmentGateway } from './segmentGateway';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type SegmentDefinition = {
  _id: string;
  contentType?: string;
  root?: SegmentNode;
};

type Decision = 'matched' | 'notMatched' | 'undecided';

const loadSegment = async (
  subdomain: string,
  segmentId: string,
): Promise<Required<SegmentDefinition> | null> => {
  const segment: SegmentDefinition | undefined = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'segment',
    action: 'findOne',
    input: { _id: segmentId },
    throwOnError: true,
  });

  if (!segment?.contentType || !segment.root) {
    return null;
  }

  return {
    _id: segment._id,
    contentType: segment.contentType,
    root: segment.root,
  };
};

const decide = async (
  subdomain: string,
  segment: Required<SegmentDefinition>,
  targetId: string,
): Promise<Decision> => {
  try {
    const { matched, notMatched } = await evaluateSegmentBatch(
      automationSegmentGateway(subdomain),
      segment,
      [targetId],
    );

    if (matched.length) {
      return 'matched';
    }

    return notMatched.length ? 'notMatched' : 'undecided';
  } catch (e) {
    debugError(
      `Segment "${segment._id}" could not be evaluated: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );

    return 'undecided';
  }
};

const decideMembership = async (
  subdomain: string,
  segmentId: string,
  targetId: string,
): Promise<Decision> => {
  if (!segmentId) {
    return 'notMatched';
  }

  let segment: Required<SegmentDefinition> | null;

  try {
    segment = await loadSegment(subdomain, segmentId);
  } catch (e) {
    debugError(
      `Segment "${segmentId}" could not be loaded: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );

    return 'undecided';
  }

  if (!segment) {
    return 'notMatched';
  }

  return decide(subdomain, segment, targetId);
};

export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  targetId: string,
  delayMs = 15000,
): Promise<boolean> => {
  const decision = await decideMembership(subdomain, segmentId, targetId);

  if (decision !== 'undecided') {
    return decision === 'matched';
  }

  await delay(delayMs);

  const retried = await decideMembership(subdomain, segmentId, targetId);

  if (retried !== 'undecided') {
    return retried === 'matched';
  }

  throw new AutomationActionError(
    `Could not decide whether "${targetId}" is in segment "${segmentId}": a service holding the definition or the values did not answer`,
    AUTOMATION_ERROR_CODES.PLUGIN_ACTION_FAILED,
  );
};
