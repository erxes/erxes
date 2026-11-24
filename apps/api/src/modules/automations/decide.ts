import type { AutomationStep } from '@erxes/core-contract';
import { type Db, integrationConnections, withOrg } from '@erxes/core-db';
import { DECISION_INTEGRATIONS, type ModelClient } from '@erxes/integrations/server';
import { parse } from '@erxes/plugin-sdk/integrations';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { connectionFor, refused } from '~/modules/integrations/actions';
import { manages } from '~/modules/integrations/connectable';
import { clientOf } from '~/modules/integrations/connections';
import { eachStep } from './cursor';
import { DEFAULT_DECISION_MODELS } from './decisionModels';

export type DecideStep = Extract<AutomationStep, { type: 'decide' }>;

type Provider = DecideStep['provider'];

export interface Question {
  question: string;
  state: string;
}

interface Decision {
  choice: string;
  confidence: number | null;
  probabilities: Record<string, number> | null;
  model: string;
}

const OTHERWISE = 'otherwise';

const INSTRUCTIONS =
  'You pick the path of a business automation. Read the state, then answer the question with exactly one of the options. An option may say what it means.';

const criteriaOf = (step: DecideStep) => ({
  ...Object.fromEntries(step.paths.map((path) => [path.label, path.meaning || null])),
  [OTHERWISE]: 'None of the other options fits',
});

const JevAnswer = z.object({
  model: z.string(),
  answers: z.object({
    path: z.object({
      choice: z.string(),
      confidence: z.number(),
      probabilities: z.record(z.string(), z.number()),
    }),
  }),
});

const askJev = async (client: ModelClient, step: DecideStep, asked: Question) => {
  const body = await client.send('/systemone', {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify({
      model: step.model || DEFAULT_DECISION_MODELS.typesafe,
      state: asked.state,
      questions: {
        path: { type: 'choice', instructions: asked.question, criteria: criteriaOf(step) },
      },
    }),
  });

  const { model, answers } = parse('TypeSafe', JevAnswer, body, 'an unreadable decision');

  return { ...answers.path, model };
};

const ChatAnswer = z.object({
  model: z.string(),
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
});

const Picked = z.object({ choice: z.string() });

const askOpenAi = async (client: ModelClient, step: DecideStep, asked: Question) => {
  const criteria = criteriaOf(step);

  const body = await client.send('/chat/completions', {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify({
      model: step.model || DEFAULT_DECISION_MODELS.openai,
      messages: [
        { role: 'system', content: INSTRUCTIONS },
        {
          role: 'user',
          content: JSON.stringify({
            question: asked.question,
            options: criteria,
            state: asked.state,
          }),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'decision',
          strict: true,
          schema: {
            type: 'object',
            properties: { choice: { type: 'string', enum: Object.keys(criteria) } },
            required: ['choice'],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  const answer = parse('OpenAI', ChatAnswer, body, 'an unreadable decision');
  const content = answer.choices.at(0)?.message.content ?? '';
  const { choice } = parse('OpenAI', Picked, content, 'a decision outside the options');

  return { choice, confidence: null, probabilities: null, model: answer.model };
};

const ASK: Record<
  Provider,
  (client: ModelClient, step: DecideStep, asked: Question) => Promise<Decision>
> = {
  typesafe: askJev,
  openai: askOpenAi,
};

const allowed = (provider: Provider) => {
  const integration = DECISION_INTEGRATIONS[provider];

  if (!manages(integration))
    throw fail(
      'NOT_ALLOWED',
      `The member who turned this automation on may no longer use ${integration.name}`,
      { permission: integration.permission },
    );

  return integration;
};

export const decide = async (orgId: string, step: DecideStep, asked: Question) => {
  const integration = allowed(step.provider);

  const client = await withOrg(orgId, async (tx) =>
    clientOf(tx, integration, await connectionFor(tx, integration, step.connection || undefined)),
  );

  try {
    return await ASK[step.provider](client, step, asked);
  } catch (error) {
    if (refused(error)) throw fail('GATEWAY_REFUSED', error.message);

    throw error;
  }
};

const decisionArm = (step: DecideStep, decision: Decision) => {
  const index = step.paths.findIndex((path) => path.label === decision.choice);

  const unsure =
    decision.confidence !== null &&
    step.minConfidence !== undefined &&
    decision.confidence < step.minConfidence;

  return index < 0 || unsure ? OTHERWISE : `path:${index}`;
};

export const decisionOutput = (step: DecideStep, decision: Decision) => {
  const arm = decisionArm(step, decision);
  const path = arm === OTHERWISE ? OTHERWISE : step.paths[Number(arm.slice(5))]?.label;

  return { arm, output: { path: path ?? OTHERWISE, ...decision } };
};

export const decisionProblems = async (client: Db, steps: AutomationStep[]) => {
  const decisions: DecideStep[] = [];

  eachStep(steps, (step) => {
    if (step.type === 'decide') decisions.push(step);
  });

  if (decisions.length === 0) return [];

  const active = await client
    .select({ id: integrationConnections.id, key: integrationConnections.key })
    .from(integrationConnections)
    .where(
      and(
        inArray(integrationConnections.key, [...new Set(decisions.map((step) => step.provider))]),
        eq(integrationConnections.status, 'active'),
      ),
    );

  return decisions.flatMap((step) => {
    const integration = DECISION_INTEGRATIONS[step.provider];
    const mine = active.filter((row) => row.key === step.provider);
    const problems: string[] = [];

    if (!step.question.trim()) problems.push(`Step ${step.id}: ask the model a question`);

    if (!manages(integration))
      problems.push(`Step ${step.id}: your role can't use ${integration.name}`);
    else if (mine.length === 0)
      problems.push(`Step ${step.id}: connect ${integration.name} in Settings › Integrations`);
    else if (step.connection && !mine.some((row) => row.id === step.connection))
      problems.push(`Step ${step.id}: that ${integration.name} connection is not active`);

    return problems;
  });
};
