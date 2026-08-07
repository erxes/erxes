import type { IModels } from '../../connectionResolver';
import type { TAiAgentInput } from '../aiAgent';
import { searchAiAgentKnowledge } from '../knowledge';
import type { TAiToolRuntime } from './tools';

export const AI_KNOWLEDGE_TOOL_ID = 'agent:knowledge-search';
export const AI_KNOWLEDGE_TOOL_NAME = 'search_knowledge';

const MAX_TOOL_RESULT_CONTENT_CHARS = 1200;

// An uploaded document's file name says nothing a customer needs and everything
// an attacker wants, so only a real human-written title survives.
const INTERNAL_FILE_NAME =
  /\.(md|markdown|txt|pdf|docx?|csv|json|ya?ml|html?)$/i;

const toPublicTitle = (title?: string) => {
  const trimmed = (title || '').trim();

  return trimmed && !INTERNAL_FILE_NAME.test(trimmed) ? trimmed : undefined;
};

const buildToolDescription = (agent: TAiAgentInput) => {
  const modules = [
    ...new Set(
      (agent.context.knowledgeSources || []).map((source) => source.moduleName),
    ),
  ];
  const scope = modules.length
    ? `Indexed sources: ${modules.join(
        ', ',
      )}, plus the agent's uploaded reference documents.`
    : `Covers the agent's uploaded reference documents.`;

  return [
    "Search the organization's indexed knowledge and return the passages that match a question.",
    scope,
    'Call this before answering any question about facts you do not already have in this conversation: policies, procedures, prices, availability, schedules, or product details.',
    'Write the query in the language the customer used, using the words they would appear under rather than repeating the sentence verbatim.',
    'An empty result means the knowledge does not contain it — say so instead of guessing.',
  ].join(' ');
};

export const buildAiKnowledgeTool = ({
  models,
  agentId,
  agent,
}: {
  models: IModels;
  agentId: string;
  agent: TAiAgentInput;
}): TAiToolRuntime | null => {
  const { retrieval, knowledgeSources, files } = agent.context;

  if (retrieval?.mode !== 'tool' || !retrieval?.enabled) {
    return null;
  }

  if (!knowledgeSources?.length && !files?.length) {
    return null;
  }

  return {
    toolId: AI_KNOWLEDGE_TOOL_ID,
    kind: 'helper',
    definition: {
      name: AI_KNOWLEDGE_TOOL_NAME,
      description: buildToolDescription(agent),
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'What to look for, in the customer’s own language.',
          },
        },
        required: ['query'],
      },
    },
    execute: async (args) => {
      const chunks = await searchAiAgentKnowledge({
        models,
        agentId,
        agent,
        searchText: String(args.query ?? ''),
      });

      return {
        found: chunks.length,
        results: chunks.map((chunk) => ({
          title: toPublicTitle(chunk.title) || toPublicTitle(chunk.fileName),
          url: chunk.sourceUrl,
          content: chunk.content.slice(0, MAX_TOOL_RESULT_CONTENT_CHARS),
        })),
      };
    },
  };
};
