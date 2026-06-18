// ---------------------------------------------------------------------------
// Agent quality scorers (Mastra-native, via createScorer from @mastra/core/evals).
//
// Two scorers, attached to each production agent (agentRuntime) and run on the
// agent's own output when scoring is enabled:
//
//   • response-completeness — heuristic, free, deterministic. 1 when the agent
//     produced a non-empty final answer, else 0. Always sampled (rate 1).
//   • answer-relevancy      — LLM-judge using the agent's OWN model. Rates 0..1
//     how directly the final answer addresses the user's latest request.
//
// Scores flow to the configured observability exporter (Langfuse) via the
// agent's registered Mastra instance — see scoring/observability.ts.
// ---------------------------------------------------------------------------
import { createScorer } from '@mastra/core/evals';
import { z } from 'zod';

// The agent scorer run shape (`type: 'agent'`): input carries the turn's
// messages, output is the assistant's produced messages. We read them loosely
// (Mastra's own types are wider) and extract plain text defensively.
interface LooseMessage {
  role?: string;
  content?:
    | string
    | {
        content?: string;
        parts?: Array<{ type?: string; text?: string }>;
      };
}
interface AgentScorerInput {
  inputMessages?: LooseMessage[];
  rememberedMessages?: LooseMessage[];
}

/** Plain text of a single message, whether it's a V1 string or a V2 parts blob. */
function messageText(msg: LooseMessage | undefined): string {
  const content = msg?.content;
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content.content === 'string' && content.content) {
    return content.content;
  }
  if (Array.isArray(content.parts)) {
    return content.parts
      .filter((p) => p?.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text)
      .join('')
      .trim();
  }
  return '';
}

/** The user's latest request text (last user message in this turn's input). */
function lastUserText(input: AgentScorerInput | undefined): string {
  const msgs = input?.inputMessages ?? [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i]?.role === 'user') return messageText(msgs[i]);
  }
  return msgs.length ? messageText(msgs[msgs.length - 1]) : '';
}

/** The assistant's final answer text (joined across produced messages). */
function assistantText(output: LooseMessage[] | undefined): string {
  return (output ?? [])
    .filter((m) => !m.role || m.role === 'assistant')
    .map(messageText)
    .join('\n')
    .trim();
}

const RELEVANCY_JUDGE_INSTRUCTIONS = [
  'You evaluate a customer-support / business AI agent.',
  'Judge ONLY how well the assistant\'s final answer addresses the user\'s',
  'latest request — relevance and completeness, not style or tone.',
  'Be strict: an off-topic, evasive, or partial answer scores low.',
].join(' ');

export interface AgentScorerEntry {
  scorer: unknown;
  sampling?: { type: 'ratio'; rate: number };
}

// Fraction of turns the (cost-bearing) LLM-judge runs on. Hardcoded — kept off
// the env surface on purpose (the feature is one flag). Lower it here if judge
// token cost becomes a concern; the heuristic scorer is free and always runs.
const LLM_JUDGE_SAMPLE_RATE = 1;

/**
 * Build the scorers for one agent. `model` is the agent's own resolved model
 * (used as the relevancy judge). The heuristic always runs; the LLM-judge runs
 * on LLM_JUDGE_SAMPLE_RATE of turns. Returns a MastraScorers-shaped record.
 */
export function buildAgentScorers(
  model: unknown,
): Record<string, AgentScorerEntry> {
  const completeness = createScorer({
    id: 'response-completeness',
    name: 'Response Completeness',
    description: 'Heuristic: 1 when the agent produced a non-empty final answer, else 0.',
    type: 'agent',
  })
    .generateScore(({ run }) =>
      assistantText(run.output as LooseMessage[]).length > 0 ? 1 : 0,
    )
    .generateReason(({ score }) =>
      score === 1 ? 'Produced a non-empty answer.' : 'Empty / no final answer.',
    );

  const relevancy = createScorer({
    id: 'answer-relevancy',
    name: 'Answer Relevancy',
    description: "How directly the agent's final answer addresses the user's latest request.",
    type: 'agent',
    judge: { model: model as never, instructions: RELEVANCY_JUDGE_INSTRUCTIONS },
  })
    .analyze({
      description: 'Score 0..1 relevancy of the answer to the request.',
      outputSchema: z.object({
        score: z.number().min(0).max(1),
        reason: z.string(),
      }),
      createPrompt: ({ run }) => {
        const question = lastUserText(run.input as AgentScorerInput);
        const answer = assistantText(run.output as LooseMessage[]);
        return [
          'USER REQUEST:',
          question || '(none captured)',
          '',
          'ASSISTANT ANSWER:',
          answer || '(empty)',
          '',
          'Return JSON {"score": <0..1>, "reason": "<one sentence>"}. ',
          '1 = fully addresses the request, 0 = irrelevant or empty.',
        ].join('\n');
      },
    })
    .generateScore(({ results }) => {
      const analyzed = (results as { analyzeStepResult?: { score?: number } })
        .analyzeStepResult;
      const score = analyzed?.score;
      return typeof score === 'number' ? score : 0;
    })
    .generateReason(({ results }) => {
      const analyzed = (results as { analyzeStepResult?: { reason?: string } })
        .analyzeStepResult;
      return analyzed?.reason ?? '';
    });

  return {
    'response-completeness': { scorer: completeness, sampling: { type: 'ratio', rate: 1 } },
    'answer-relevancy': {
      scorer: relevancy,
      sampling: { type: 'ratio', rate: LLM_JUDGE_SAMPLE_RATE },
    },
  };
}
