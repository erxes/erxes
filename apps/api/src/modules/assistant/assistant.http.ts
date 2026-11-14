import { AssistantChatRequest } from '@erxes/core-contract';
import { caller, newId, requestOrgId, withOrg } from '@erxes/core-db';
import { CONTEXT_LOGGER_SYMBOL } from '@orpc/experimental-pino';
import { pipeUIMessageStreamToResponse, type UIMessage, type UIMessageChunk } from 'ai';
import { Router, type Request, type Response } from 'express';
import { can } from '~/http/access';
import { HttpError } from '~/http/errors';
import { chatTools, generateTitle, type Run, streamTurn } from './agent';
import { getSettings } from './settings.service';
import { readTurnContext } from './turnContext';
import { beginTurn, saveReply, setTitle } from './turns.service';

const chatMember = () => {
  const who = caller();

  if (who.type === 'plugin') throw new HttpError(403, 'MEMBERS_ONLY', 'Plugins cannot do this');

  if (who.type !== 'user') throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

  if (!can(who, 'assistant.chat')) {
    throw new HttpError(403, 'NOT_ALLOWED', "Your role doesn't allow this", {
      permission: 'assistant.chat',
    });
  }

  return who;
};

const parseRequest = (body: unknown) => {
  const parsed = AssistantChatRequest.safeParse(body);

  if (!parsed.success) {
    throw new HttpError(400, 'INVALID_INPUT', 'The request is not valid', {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
};

const startRun = async (req: Request, res: Response, orgId: string) => {
  const member = chatMember();
  const request = parseRequest(req.body);
  const threadId = request.threadId ?? newId();
  const context = { req, res, [CONTEXT_LOGGER_SYMBOL]: req.log };

  return withOrg(orgId, async (tx) => {
    const turnContext = await readTurnContext(request.message);
    const { approvalMode } = await getSettings(tx);
    const scope = { member, orgId, threadId, approvalMode, context };
    const tools = chatTools(scope);
    const turn = await beginTurn(tx, request, tools, { threadId, context: turnContext });

    const run: Run = {
      scope,
      tools,
      request,
      provider: turn.provider,
      apiKey: turn.apiKey,
      threadId: turn.thread.id,
      messages: turn.messages,
    };

    return { run, titled: turn.thread.title !== null };
  });
};

const drain = (stream: ReadableStream<UIMessageChunk>) => stream.pipeTo(new WritableStream());

const finish = async (req: Request, orgId: string, run: Run, reply: UIMessage | null) => {
  await withOrg(orgId, (tx) => saveReply(tx, run.threadId, reply));

  const title = await generateTitle(run).catch((error: unknown) => {
    req.log.warn({ err: error, threadId: run.threadId }, 'assistant: no title for the thread');

    return null;
  });

  if (title) await withOrg(orgId, (tx) => setTitle(tx, run.threadId, title));
};

const answer = async (req: Request, res: Response, orgId: string, run: Run, titled: boolean) => {
  const turn = await streamTurn(run);
  const [toClient, toServer] = turn.stream.tee();

  const saved = drain(toServer)
    .catch((error: unknown) => {
      req.log.error({ err: error, threadId: run.threadId }, 'assistant: the reply stopped');
    })
    .then(() =>
      titled
        ? withOrg(orgId, (tx) => saveReply(tx, run.threadId, turn.reply()))
        : finish(req, orgId, run, turn.reply()),
    )
    .catch((error: unknown) => {
      req.log.error({ err: error, threadId: run.threadId }, 'assistant: could not save the reply');
    });

  req.socket.setTimeout(0);
  await pipeUIMessageStreamToResponse({ response: res, stream: toClient });
  await saved;
};

export const assistantChatRouter = Router();

assistantChatRouter.post('/assistant/chat', async (req, res) => {
  const orgId = requestOrgId();
  const { run, titled } = await startRun(req, res, orgId);

  try {
    await answer(req, res, orgId, run, titled);
  } catch (error) {
    await withOrg(orgId, (tx) => saveReply(tx, run.threadId, null));

    if (!res.headersSent) throw error;

    req.log.error({ err: error, threadId: run.threadId }, 'assistant: the chat failed');
    res.destroy();
  }
});
