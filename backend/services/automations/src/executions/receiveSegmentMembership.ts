import {
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_SEGMENT_MEMBERSHIP_EVENT,
  AUTOMATION_SEGMENT_MEMBERSHIP_FOLKS,
  IAutomationTrigger,
  isSegmentMembershipTrigger,
  segmentMembershipRunsEveryTime,
  TAutomationSegmentMembershipJob,
} from 'erxes-api-shared/core-modules';
import { IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { loadSubject } from '../utils/loadSubject';
import { getExecutionActionsMap } from '../utils/utils';
import { buildExecutionTarget, buildTriggeredVia } from './calculateExecutions';
import { executeActions } from './executeActions';

const FOLK_DESCRIPTIONS = {
  joined: 'Entered the segment',
  left: 'Left the segment',
};

/**
 * The segment worker already decided who crossed, so there is nothing left
 * to check: every crossing starts a run from the exit it took. Entering twice
 * is two events, unless the trigger says `once`: then a record starts it only
 * the first time.
 */
export const receiveSegmentMembership = async ({
  models,
  subdomain,
  contentType,
  transitions,
}: TAutomationSegmentMembershipJob & {
  models: IModels;
  subdomain: string;
}) => {
  const automations = await models.Automations.find({
    status: 'active',
    ownedBy: { $exists: false },
    triggers: {
      $elemMatch: {
        type: contentType,
        'config.event': AUTOMATION_SEGMENT_MEMBERSHIP_EVENT,
        'config.segmentId': {
          $in: transitions.map(({ segmentId }) => segmentId),
        },
      },
    },
  }).lean();

  if (!automations.length) {
    return;
  }

  const subjects = new Map<string, Promise<Record<string, any> | null>>();

  const subjectOf = (subjectId: string) => {
    if (!subjects.has(subjectId)) {
      subjects.set(subjectId, loadSubject(subdomain, contentType, subjectId));
    }
    return subjects.get(subjectId) as Promise<Record<string, any> | null>;
  };

  for (const transition of transitions) {
    for (const folk of AUTOMATION_SEGMENT_MEMBERSHIP_FOLKS) {
      for (const automation of automations) {
        for (const trigger of automation.triggers as IAutomationTrigger[]) {
          const startActionId = trigger.config?.[folk];

          if (
            !startActionId ||
            trigger.type !== contentType ||
            !isSegmentMembershipTrigger(trigger) ||
            trigger.config?.segmentId !== transition.segmentId
          ) {
            continue;
          }

          for (const subjectId of transition[folk]) {
            try {
              // Run once: a record that already went through this trigger
              // never starts it again, whichever way it crossed.
              if (
                !segmentMembershipRunsEveryTime(trigger.config) &&
                (await models.Executions.exists({
                  automationId: automation._id,
                  triggerId: trigger.id,
                  targetId: subjectId,
                }))
              ) {
                continue;
              }

              const subject = await subjectOf(subjectId);

              if (!subject) {
                continue;
              }

              const target = buildExecutionTarget(subject);
              const execution = await models.Executions.create({
                automationId: automation._id,
                triggerId: trigger.id,
                triggerType: trigger.type,
                triggerConfig: trigger.config,
                targetId: target._id,
                target,
                status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
                description: FOLK_DESCRIPTIONS[folk],
                createdVia: buildTriggeredVia(automation),
                createdAt: new Date(),
              });

              await executeActions(
                subdomain,
                trigger.type,
                execution,
                await getExecutionActionsMap(automation, execution),
                startActionId,
              );
            } catch (error) {
              debugError(
                `Segment membership run failed for automation ${
                  automation._id
                }, subject ${subjectId}: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
          }
        }
      }
    }
  }
};
