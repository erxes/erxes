import type { IModels } from '../../connectionResolver';
import type { TAiAgentInput } from '../aiAgent';
import {
  searchAiAgentKnowledge,
  searchAiAgentKnowledgeSection,
  toPublicKnowledgeTitle,
  type TAiAgentKnowledge,
} from '../knowledge';
import type { TAiToolRuntime } from './tools';

export const AI_KNOWLEDGE_TOOL_ID = 'agent:knowledge-search';
export const AI_KNOWLEDGE_TOOL_NAME = 'search_knowledge';

export const AI_KNOWLEDGE_EMPTY_RESULT = 'No passages found.';

const MAX_TOOL_RESULT_CONTENT_CHARS = 2000;

const TOOL_DESCRIPTION = [
  "Read the organization's knowledge and return the passages of the chosen sections.",
  'Pick every section from the knowledge index given in the instructions that could hold the answer, exactly as written there — section names may be in another language than the customer’s words.',
  'Add a query only to narrow a large section, using the words the index itself uses — that is the language the knowledge is written in, which may differ from the customer’s.',
  'An empty result means the knowledge does not contain it — say so instead of guessing.',
].join(' ');

// Only a knowledge too large for the prompt is searched; the model chooses the
// section from the index, so a question in any language finds its passages.
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
            description: 'The knowledge sections to read.',
          },
          query: {
            type: 'string',
            description:
              'Optional keywords, in the language of the knowledge index.',
          },
        },
        required: ['sections'],
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
      const chunks = chunkIds.length
        ? await searchAiAgentKnowledgeSection({ models, chunkIds, query })
        : await searchAiAgentKnowledge({
            models,
            agentId,
            agent,
            searchText: [...sections, query].filter(Boolean).join(' '),
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

          return [
            heading ? `[${heading}]` : '',
            chunk.content.slice(0, MAX_TOOL_RESULT_CONTENT_CHARS),
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');
    },
  };
};
