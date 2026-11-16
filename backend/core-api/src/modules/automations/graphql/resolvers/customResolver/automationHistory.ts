import {
  stepVersionsOf,
  TVersionMark,
} from '@/automations/utils/automationVersions';
import { IAutomationExecution } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

// One read of an automation's versions per request, however many runs ask
const marksByRequest = new WeakMap<
  IContext,
  Map<string, Promise<TVersionMark[]>>
>();

const versionMarksOf = (context: IContext, automationId: string) => {
  const cache = marksByRequest.get(context) || new Map();
  marksByRequest.set(context, cache);

  if (!cache.has(automationId)) {
    cache.set(
      automationId,
      context.models.AutomationVersions.versionMarks(automationId),
    );
  }

  return cache.get(automationId) as Promise<TVersionMark[]>;
};

export const AutomationHistory = {
  /** The version each step ran on, in the order of `actions`. */
  async actionVersions(
    { automationId, actions = [], createdAt }: IAutomationExecution,
    _args: unknown,
    context: IContext,
  ) {
    if (!actions.length) {
      return [];
    }

    const marks = await versionMarksOf(context, automationId);

    return stepVersionsOf(marks, actions, createdAt);
  },
};
