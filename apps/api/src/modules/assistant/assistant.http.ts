import { AssistantChatRequest } from '@erxes/core-contract';
import { caller, newId, requestOrgId, withOrg } from '@erxes/core-db';
import { CONTEXT_LOGGER_SYMBOL } from '@orpc/experimental-pino';
import { pipeUIMessageStreamToResponse, type UIMessage, type UIMessageChunk } from 'ai';
import { Router, type Request, type Response } from 'express';
import { can } from '~/http/access';
import { fail, invalidInput } from '~/http/errors';
import { chatTools, generateTitle, type Run, streamTurn } from './agent';
import { attachmentsOf, readContents } from './attachments';
import { installedPlugins } from './plugins';
import { getSettings } from './settings.service';
import { readTurnContext } from './turnContext';
import { beginTurn, saveReply, setTitle } from './turns.service';

const chatMember = () => {
  const who = caller();

  if (who.type === 'plugin') throw fail('MEMBERS_ONLY', 'Plugins cannot do this');

  if (who.type !== 'user') throw fail('UNAUTHORIZED', 'Sign in to continue');

  if (!can(who, 'assistant.chat')) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: 'assistant.chat',
    });
  }

  return who;
};

const parseRequest = (body: unknown) => {
  const parsed = AssistantChatRequest.safeParse(body);

  if (!parsed.success) throw invalidInput(parsed.error);

  return parsed.data;
};

const contentsToContinue = (orgId: string, messages: UIMessage[]) =>
  readContents(
    orgId,
    attachmentsOf(messages.findLast(({ role }) => role === 'user')?.parts ?? []),
    {
      strict: false,
    },
  );

const startRun = async (req: Request, res: Response, orgId: string) => {
  const member = chatMember();
  const request = parseRequest(req.body);
  const threadId = request.threadId ?? newId();
  const context = { req, res, [CONTEXT_LOGGER_SYMBOL]: req.log };
  const turnContext = await withOrg(orgId, () => readTurnContext(request.message));

  const sent = await readContents(orgId, [...turnContext.files, ...turnContext.snapshots], {
    strict: true,
  });

  const { run, titled } = await withOrg(orgId, async (tx) => {
    const { approvalMode, codeMode } = await getSettings(tx);
    const plugins = await installedPlugins(tx);
    const scope = { member, orgId, threadId, approvalMode, codeMode, plugins, context };
    const tools = chatTools(scope);
    const turn = await beginTurn(tx, request, tools, { threadId, context: turnContext });

    const started: Run = {
      scope,
      tools,
      request,
      provider: turn.provider,
      apiKey: turn.apiKey,
      threadId: turn.thread.id,
      messages: turn.messages,
      contents: sent,
    };

    return { run: started, titled: turn.thread.title !== null };
  });

  if (request.message.role === 'user') return { run, titled };

  return { run: { ...run, contents: await contentsToContinue(orgId, run.messages) }, titled };
};

const drain = (stream: ReadableStream<UIMessageChunk>) => stream.pipeTo(new WritableStream());

const closingAfter = (settled: Promise<void>) =>
  new TransformStream<UIMessageChunk, UIMessageChunk>({ flush: () => settled });

const titleThread = async (req: Request, orgId: string, run: Run) => {
  try {
    const title = await generateTitle(run);

    if (title) await withOrg(orgId, (tx) => setTitle(tx, run.threadId, title));
  } catch (error) {
    req.log.warn({ err: error, threadId: run.threadId }, 'assistant: no title for the thread');
  }
};

const answer = async (req: Request, res: Response, orgId: string, run: Run, titled: boolean) => {
  const turn = await streamTurn(run);
  const [toClient, toServer] = turn.stream.tee();

  const saved = drain(toServer)
    .catch((error: unknown) => {
      req.log.error({ err: error, threadId: run.threadId }, 'assistant: the reply stopped');
    })
    .then(() => withOrg(orgId, (tx) => saveReply(tx, run.threadId, turn.reply())))
    .catch((error: unknown) => {
      req.log.error({ err: error, threadId: run.threadId }, 'assistant: could not save the reply');
    });

  const done = titled ? saved : saved.then(() => titleThread(req, orgId, run));

  req.socket.setTimeout(0);
  await pipeUIMessageStreamToResponse({
    response: res,
    stream: toClient.pipeThrough(closingAfter(saved)),
  });
  await done;
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
