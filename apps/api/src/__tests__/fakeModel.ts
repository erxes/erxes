import { once } from 'node:events';
import { createServer, type ServerResponse } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

const ChatRequest = z.looseObject({
  model: z.string(),
  stream: z.boolean().optional(),
  messages: z.array(
    z.looseObject({
      role: z.string(),
      content: z.union([
        z.string(),
        z.array(z.looseObject({ text: z.string().optional() })),
        z.null(),
      ]),
      tool_call_id: z.string().optional(),
    }),
  ),
  tools: z.array(z.looseObject({ function: z.looseObject({ name: z.string() }) })).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequest>;

export type Reply =
  | { text: string; delayMs?: number; reasoning?: string }
  | { tool: string; input: Record<string, unknown>; reasoning?: string };

export type Script = (request: ChatRequest) => Reply;

const textOf = (content: ChatRequest['messages'][number]['content']) =>
  typeof content === 'string' ? content : (content ?? []).map((part) => part.text ?? '').join('');

const isTitleRequest = (request: ChatRequest) =>
  request.messages.some((message) => textOf(message.content).includes('short title'));

export const lastToolResult = (request: ChatRequest) => {
  const last = request.messages.at(-1);

  return last?.role === 'tool' ? textOf(last.content) : null;
};

const chunk = (delta: Record<string, unknown>, finish: string | null = null) =>
  `data: ${JSON.stringify({
    id: 'chatcmpl-test',
    object: 'chat.completion.chunk',
    created: 1,
    model: 'kimi-k3',
    choices: [{ index: 0, delta, finish_reason: finish }],
  })}\n\n`;

const streamReply = async (res: ServerResponse, reply: Reply, calls: number) => {
  res.writeHead(200, { 'content-type': 'text/event-stream' });

  if (reply.reasoning) res.write(chunk({ role: 'assistant', reasoning_content: reply.reasoning }));

  if ('tool' in reply) {
    res.write(
      chunk({
        role: 'assistant',
        tool_calls: [
          {
            index: 0,
            id: `call_${calls}`,
            type: 'function',
            function: { name: reply.tool, arguments: JSON.stringify(reply.input) },
          },
        ],
      }),
    );
    res.write(chunk({}, 'tool_calls'));
  } else {
    for (const word of reply.text.split(/(?<= )/)) {
      res.write(chunk({ role: 'assistant', content: word }));

      if (reply.delayMs) await sleep(reply.delayMs);
    }

    res.write(chunk({}, 'stop'));
  }

  res.end('data: [DONE]\n\n');
};

const jsonReply = (res: ServerResponse, reply: Reply) => {
  const text = 'text' in reply ? reply.text : '';

  res.writeHead(200, { 'content-type': 'application/json' }).end(
    JSON.stringify({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: 1,
      model: 'kimi-k3',
      choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    }),
  );
};

export const fakeModel = async (apiKey: string, port = 0) => {
  const requests: ChatRequest[] = [];

  const state: { script: Script; models: string[]; listStatus: number } = {
    script: () => ({ text: 'Hello there' }),
    models: ['kimi-k3', 'kimi-embedding-v1'],
    listStatus: 200,
  };

  const server = createServer((req, res) => {
    let raw = '';

    req.on('data', (data: Buffer) => {
      raw += data.toString();
    });
    req.on('end', () => {
      if (req.headers.authorization !== `Bearer ${apiKey}`) {
        res.writeHead(401, { 'content-type': 'application/json' }).end(
          JSON.stringify({
            error: { message: `Invalid key ${String(req.headers.authorization)}` },
          }),
        );

        return;
      }

      if (req.url?.endsWith('/models')) {
        res
          .writeHead(state.listStatus, { 'content-type': 'application/json' })
          .end(JSON.stringify({ data: state.models.map((id) => ({ id, created: 1 })) }));

        return;
      }

      const request = ChatRequest.parse(JSON.parse(raw));

      requests.push(request);

      const reply = isTitleRequest(request) ? { text: 'Test title' } : state.script(request);

      if (request.stream) void streamReply(res, reply, requests.length);
      else jsonReply(res, reply);
    });
  }).listen(port);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  return {
    url: `http://127.0.0.1:${address.port}/v1`,
    requests,
    chats: () => requests.filter((request) => !isTitleRequest(request)),
    lastToolResult: () => {
      const last = requests.filter((request) => !isTitleRequest(request)).at(-1);

      return last ? (lastToolResult(last) ?? '') : '';
    },
    script: (next: Script) => {
      state.script = next;
    },
    models: (ids: string[], status = 200) => {
      state.models = ids;
      state.listStatus = status;
    },
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
