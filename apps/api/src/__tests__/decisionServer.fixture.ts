import { once } from 'node:events';
import { createServer, type ServerResponse } from 'node:http';
import { z } from 'zod';

export const TYPESAFE_KEY = 'ts-test-key-0001';

export const OPENAI_KEY = 'sk-test-key-0001';

const JevRequest = z.object({
  model: z.string(),
  state: z.string(),
  questions: z.object({
    path: z.object({
      type: z.literal('choice'),
      instructions: z.string(),
      criteria: z.record(z.string(), z.string().nullable()),
    }),
  }),
});

const OpenAiRequest = z.object({
  model: z.string(),
  input: z.array(z.object({ role: z.string(), content: z.string() })),
  questions: z
    .array(
      z.object({
        type: z.literal('choice'),
        name: z.string(),
        instructions: z.string(),
        choices: z.array(z.object({ value: z.string(), description: z.string().optional() })),
      }),
    )
    .length(1),
});

const sendJson = (res: ServerResponse, status: number, body: unknown) =>
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));

export const startDecisionServer = async () => {
  const jevCalls: z.infer<typeof JevRequest>[] = [];
  const openAiCalls: z.infer<typeof OpenAiRequest>[] = [];

  const next = {
    jev: {
      choice: 'billing',
      confidence: 0.92,
      probabilities: { billing: 0.92, support: 0.05, otherwise: 0.03 },
      model: 'jev-1.14.0',
    },
    openai: {
      choice: 'support',
      confidence: 0.81,
      probabilities: [
        { value: 'billing', probability: 0.1 },
        { value: 'support', probability: 0.81 },
        { value: 'otherwise', probability: 0.09 },
      ],
      model: 'gpt-6-luna',
    },
    typeSafeModelsStatus: 200,
    typeSafeModels: [
      { id: 'jev-preview' },
      { id: 'jev-1.13.0' },
      { id: 'jev-1.14.0' },
      { id: 'jev-latest' },
    ],
    openAiModels: [
      { id: 'gpt-6-luna' },
      { id: 'gpt-5.6-luna' },
      { id: 'gpt-4o-mini' },
      { id: 'whisper-1' },
      { id: 'dall-e-3' },
    ],
  };

  const server = createServer((req, res) => {
    let raw = '';

    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      const auth = req.headers.authorization;
      const url = req.url ?? '';

      if (url.endsWith('/models')) {
        if (auth === `Bearer ${TYPESAFE_KEY}`) {
          sendJson(
            res,
            next.typeSafeModelsStatus,
            next.typeSafeModelsStatus === 200
              ? { data: next.typeSafeModels }
              : { error: 'Not found' },
          );

          return;
        }

        if (auth === `Bearer ${OPENAI_KEY}`) {
          sendJson(res, 200, { data: next.openAiModels });

          return;
        }

        sendJson(res, 401, { error: 'Denied' });

        return;
      }

      if (url.endsWith('/systemone') && auth === `Bearer ${TYPESAFE_KEY}`) {
        jevCalls.push(JevRequest.parse(JSON.parse(raw)));
        sendJson(res, 200, {
          model: next.jev.model,
          answers: { path: { type: 'choice', ...next.jev } },
        });

        return;
      }

      if (url.endsWith('/decisions') && auth === `Bearer ${OPENAI_KEY}`) {
        openAiCalls.push(OpenAiRequest.parse(JSON.parse(raw)));

        const { model, ...answer } = next.openai;

        sendJson(res, 200, { model, answers: [{ type: 'choice', name: 'path', ...answer }] });

        return;
      }

      sendJson(res, 401, { error: 'Unauthorized' });
    });
  }).listen(0);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  return {
    url: `http://127.0.0.1:${address.port}/v1`,
    jevCalls,
    openAiCalls,
    next,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
