import { TAiMemoryScope } from 'erxes-api-shared/core-modules';
import { IModels } from '../../connectionResolver';
import { IAiMemoryEventDocument } from '../../mongo/aiMemoryEvent';
import { findSubject } from '../../utils/loadSubject';
import type { TAiToolRuntime } from '../aiAction/tools';
import { AI_MEMORY_BATCH_SIZE, loadAiMemoryEvents } from './events';

export const AI_MEMORY_RECALL_TOOL_ID = 'agent:memory-recall';
export const AI_MEMORY_RECALL_TOOL_NAME = 'recall_memory';

// What was made and how to tell it apart, not which tool made it or the whole
// record: measured, the tool names taught the model to repeat earlier picks
// and the full records crowded out the choice it had to make.
export type TAiPastAction = {
  at: string;
  record?: {
    type: string;
    id: string;
    // Read from its owner now, not when it was made
    exists?: false;
    acceptsFollowUp?: false;
  };
  fields?: Record<string, unknown>;
};

export const toAiPastActions = async (
  subdomain: string,
  events: IAiMemoryEventDocument[],
): Promise<TAiPastAction[]> =>
  Promise.all(
    events.map(async (event) => {
      const subject = event.record
        ? await findSubject(subdomain, event.record.type, event.record.id)
        : null;

      return {
        at: new Date(event.createdAt).toISOString(),
        record: event.record
          ? {
              type: event.record.type,
              id: event.record.id,
              ...(subject?.found ? {} : { exists: false as const }),
              ...(subject?.found && subject.acceptsFollowUp === false
                ? { acceptsFollowUp: false as const }
                : {}),
            }
          : undefined,
        fields: Object.keys(event.fields || {}).length
          ? event.fields
          : undefined,
      };
    }),
  );

export const loadAiPastActions = async ({
  subdomain,
  models,
  scopes,
}: {
  subdomain: string;
  models: IModels;
  scopes: TAiMemoryScope[];
}) => {
  const { events, total } = await loadAiMemoryEvents({ models, scopes });

  return {
    pastActions: await toAiPastActions(subdomain, events),
    olderCount: Math.max(0, total - events.length),
  };
};

// Only offered when there is more than the prompt shows.
export const buildAiMemoryRecallTool = ({
  subdomain,
  models,
  scopes,
}: {
  subdomain: string;
  models: IModels;
  scopes: TAiMemoryScope[];
}): TAiToolRuntime => ({
  toolId: AI_MEMORY_RECALL_TOOL_ID,
  kind: 'helper',
  definition: {
    name: AI_MEMORY_RECALL_TOOL_NAME,
    description: `Read older actions you took for this conversation or customer, ${AI_MEMORY_BATCH_SIZE} per page, newest first. Page 1 is what you were already given.`,
    parameters: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page to read, from 2.' },
      },
      required: ['page'],
    },
  },
  execute: async (args) => {
    const page = Math.max(2, Math.floor(Number(args.page) || 2));
    const { events } = await loadAiMemoryEvents({ models, scopes, page });

    return events.length
      ? toAiPastActions(subdomain, events)
      : 'No older actions.';
  },
});
