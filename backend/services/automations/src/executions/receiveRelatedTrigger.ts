import {
  gatherSegmentEventTypes,
  IAutomationTrigger,
  SegmentDiff,
  segmentJoinChanges,
  segmentSubjectsReachedBy,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { loadSubject } from '../utils/loadSubject';
import { getExecutionActionsMap } from '../utils/utils';
import { calculateExecution } from './calculateExecutions';
import { executeActions } from './executeActions';

type TriggerSegment = {
  _id: string;
  contentType?: string;
  dependsOn?: string[];
};

const matchesTriggerType = (triggerType: string, incomingType: string) =>
  triggerType === incomingType || triggerType.startsWith(`${incomingType}.`);

const loadSegment = (subdomain: string, segmentId: string) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'segment',
    action: 'findOne',
    input: { _id: segmentId },
    defaultValue: null,
  }) as Promise<TriggerSegment | null>;

/**
 * Trigger segments are never materialized, so a change to a record the
 * segment reads through (a deal won for a customer) reaches no automation of
 * the subject's own type. This re-asks those automations for the subjects the
 * change can move; enroll-once still decides who actually starts.
 */
export const receiveRelatedTrigger = async ({
  models,
  subdomain,
  type,
  targets,
  eventUpdateDescription,
  excludeAutomationIds = [],
}: {
  models: IModels;
  subdomain: string;
  type: string;
  targets: Array<{ _id?: unknown } | null | undefined>;
  eventUpdateDescription?: SegmentDiff;
  excludeAutomationIds?: string[];
}) => {
  const docIds = (targets || [])
    .map((target) => target?._id)
    .filter((id): id is string => typeof id === 'string' && !!id);

  if (!docIds.length) {
    return;
  }

  const automations = await models.Automations.find({
    status: 'active',
    ownedBy: { $exists: false },
    ...(excludeAutomationIds.length
      ? { _id: { $nin: excludeAutomationIds } }
      : {}),
    triggers: {
      $elemMatch: {
        isCustom: { $ne: true },
        'config.contentId': { $exists: true, $ne: '' },
      },
    },
  }).lean();

  if (!automations.length) {
    return;
  }

  const changedTypes = (await gatherSegmentEventTypes()).get(type) || [];

  if (!changedTypes.length) {
    return;
  }

  const changed = await segmentJoinChanges(type, eventUpdateDescription);

  const segments = new Map<string, Promise<TriggerSegment | null>>();
  const subjects = new Map<string, Promise<Record<string, any> | null>>();

  const segmentOf = (segmentId: string) => {
    if (!segments.has(segmentId)) {
      segments.set(segmentId, loadSegment(subdomain, segmentId));
    }
    return segments.get(segmentId) as Promise<TriggerSegment | null>;
  };

  const subjectOf = (objectType: string, subjectId: string) => {
    const key = `${objectType}:${subjectId}`;
    if (!subjects.has(key)) {
      subjects.set(key, loadSubject(subdomain, objectType, subjectId));
    }
    return subjects.get(key) as Promise<Record<string, any> | null>;
  };

  for (const automation of automations) {
    for (const trigger of automation.triggers as IAutomationTrigger[]) {
      const segmentId = trigger.config?.contentId;

      // Own-type triggers were already offered this event by receiveTrigger.
      if (
        trigger.isCustom ||
        !segmentId ||
        matchesTriggerType(trigger.type, type) ||
        trigger.config?.recordType === 'new'
      ) {
        continue;
      }

      try {
        const segment = await segmentOf(segmentId);

        if (
          !segment?.contentType ||
          segment.contentType !== trigger.type ||
          !segment.dependsOn?.some((dep) => changedTypes.includes(dep))
        ) {
          continue;
        }

        const subjectIds = await segmentSubjectsReachedBy(
          subdomain,
          { _id: segment._id, contentType: segment.contentType },
          changedTypes,
          docIds,
          changed,
        );

        for (const subjectId of subjectIds) {
          const target = await subjectOf(trigger.type, subjectId);

          if (!target) {
            continue;
          }

          // No eventUpdateDescription: the subject itself did not change.
          const execution = await calculateExecution({
            models,
            subdomain,
            automation,
            trigger,
            target,
          });

          if (execution) {
            await executeActions(
              subdomain,
              trigger.type,
              execution,
              await getExecutionActionsMap(automation, execution),
              trigger.actionId,
            );
          }
        }
      } catch (error) {
        debugError(
          `Related trigger ${type} → ${trigger.type} failed for automation ${automation._id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }
};
