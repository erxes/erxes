import type { IModels } from '../../connectionResolver';
import type { TAiAgentInput } from '../aiAgent';
import {
  searchAiAgentKnowledge,
  searchAiAgentKnowledgeByQuery,
  searchAiAgentKnowledgeSection,
  toPublicKnowledgeTitle,
  type TAiAgentKnowledge,
} from '../knowledge';
import type { TAiToolRuntime } from './tools';

export const AI_KNOWLEDGE_TOOL_ID = 'agent:knowledge-search';
export const AI_KNOWLEDGE_TOOL_NAME = 'search_knowledge';

export const AI_KNOWLEDGE_EMPTY_RESULT = 'No passages found.';

const TOOL_DESCRIPTION = [
  "Search the organization's knowledge and return the passages that match.",
  'Put in query the words that name what the customer asks about — a product or model name, a place, a policy or topic — as the knowledge would write them; the knowledge may be in another language than the customer’s words, so add those words too.',
  'The query is matched against the whole knowledge. Sections from the knowledge index are optional: passages inside them rank higher.',
  'To read a whole section, for example to list what it offers, give the section without a query.',
  'An empty result means the knowledge does not contain it — say so instead of guessing.',
].join(' ');

// Only a knowledge too large for the prompt is searched. The query finds the
// passages; the index's sections only rank them, since a name need not say
// what it holds.
export const buildAiKnowledgeTool = ({
  models,
  agentId,
  agent,
  knowledge,
}: {
  models: IModels;
  agentId: string;
  agent: TAiAgentInput;
  knowledge: TAiAgentKnowledge;
}): TAiToolRuntime | null => {
  if (knowledge.kind !== 'indexed') {
    return null;
  }

  return {
    toolId: AI_KNOWLEDGE_TOOL_ID,
    kind: 'helper',
    definition: {
      name: AI_KNOWLEDGE_TOOL_NAME,
      description: TOOL_DESCRIPTION,
      parameters: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: { type: 'string', enum: knowledge.sections },
            description:
              'Optional sections to rank first, or to read whole when there is no query.',
          },
          query: {
            type: 'string',
            description:
              'Words that name what is asked about, in the language of the knowledge and the customer.',
          },
        },
        required: [],
      },
    },
    execute: async (args) => {
      const sections = Array.isArray(args.sections)
        ? args.sections.filter(
            (section): section is string => typeof section === 'string',
          )
        : [];
      const query = String(args.query ?? '');
      const chunkIds = [
        ...new Set(
          sections.flatMap(
            (section) => knowledge.chunkIdsBySection.get(section) || [],
          ),
        ),
      ];
      // Unknown sections still get a whole-knowledge keyword search rather
      // than a hard failure the model would answer around.
      const chunks = query.trim()
        ? await searchAiAgentKnowledgeByQuery({
            models,
            agentId,
            agent,
            query,
            sections,
            chunkIds,
          })
        : chunkIds.length
        ? await searchAiAgentKnowledgeSection({ models, chunkIds, query })
        : await searchAiAgentKnowledge({
            models,
            agentId,
            agent,
            searchText: sections.join(' '),
          });

      if (!chunks.length) {
        return AI_KNOWLEDGE_EMPTY_RESULT;
      }

      // Plain text, like knowledge read whole: inside JSON a passage's line
      // breaks become "\n" and a figure loses the line that qualifies it.
      return chunks
        .map((chunk) => {
          const title =
            toPublicKnowledgeTitle(chunk.title) ||
            toPublicKnowledgeTitle(chunk.fileName);
          const heading = [title, chunk.sourceUrl].filter(Boolean).join(' — ');

          return [heading ? `[${heading}]` : '', chunk.content]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');
    },
  };
};
