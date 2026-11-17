import type {
  AssistantChatRequest,
  AssistantProvider,
  AssistantThinkingLevel,
} from '@erxes/core-contract';
import { newId } from '@erxes/core-db';
import {
  convertToModelMessages,
  generateText,
  isToolUIPart,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { instructionsFor, TITLE_INSTRUCTIONS } from './instructions';
import { outputTokens, shortAnswer, thinkingProviderOptions } from './modelThinking';
import { createModel, DEFAULT_MODELS, describeProviderError } from './providers';
import { apiTools, approvalFor, type ToolScope } from './tools/apiTools';
import { askUser } from './tools/askUser';
import { createArtifact } from './tools/createArtifact';
import { readAttachment } from './tools/readAttachment';
import { runCode } from './tools/runCode';
import { loadSkill, skillsFor } from './skills/skills';
import { type Contents, forModel } from './attachments';
import { modelTextOf } from './turnContext';

const MAX_STEPS = 32;

const MAX_OUTPUT_TOKENS = 16_384;

const TEMPERATURE = 0.2;

const TITLE_LIMIT = 120;

export const chatTools = (scope: ToolScope) => ({
  ...apiTools(scope),
  ask_user: askUser,
  readAttachment: readAttachment(scope),
  createArtifact,
  loadSkill: loadSkill(skillsFor(scope.plugins)),
  runCode: runCode(scope),
});

type ChatTools = ReturnType<typeof chatTools>;

const offeredTools = (scope: ToolScope, tools: ChatTools) =>
  Object.keys(tools).filter(
    (name): name is keyof ChatTools => scope.codeMode || name !== 'runCode',
  );

export interface Run {
  scope: ToolScope;
  tools: ChatTools;
  provider: AssistantProvider;
  apiKey: string;
  threadId: string;
  messages: UIMessage[];
  contents: Contents;
  request: AssistantChatRequest;
}

const temperatureFor = (provider: AssistantProvider) =>
  provider === 'kimi' ? {} : { temperature: TEMPERATURE };

const modelOf = ({ provider, request }: Pick<Run, 'provider' | 'request'>) =>
  request.model ?? DEFAULT_MODELS[provider];

const turnProviderOptions = (
  provider: AssistantProvider,
  model: string,
  level: AssistantThinkingLevel,
) => {
  const thinking = thinkingProviderOptions(provider, model, level);

  return provider === 'openai'
    ? { ...thinking, openai: { ...thinking?.openai, store: false } }
    : thinking;
};

const stoppedReply = (message: UIMessage): UIMessage => ({
  ...message,
  parts: message.parts.map((part) =>
    isToolUIPart(part) && (part.state === 'input-streaming' || part.state === 'input-available')
      ? { ...part, state: 'output-error', input: part.input ?? {}, errorText: 'Stopped' }
      : part,
  ),
});

export const streamTurn = async (run: Run, abortSignal: AbortSignal) => {
  const { provider, apiKey, tools, scope, request } = run;
  const model = modelOf(run);
  const level = request.thinkingLevel ?? 'off';
  let reply: UIMessage | null = null;

  const result = streamText({
    model: createModel(provider, model, apiKey),
    instructions: instructionsFor(new Date(), skillsFor(scope.plugins), scope.codeMode),
    messages: await convertToModelMessages(forModel(run.messages, run.contents), {
      tools,
      convertDataPart: modelTextOf,
    }),
    tools,
    activeTools: offeredTools(scope, tools),
    toolApproval: { callApi: (input) => approvalFor(scope, input) },
    stopWhen: stepCountIs(MAX_STEPS),
    abortSignal,
    maxOutputTokens: outputTokens(provider, model, level, MAX_OUTPUT_TOKENS),
    providerOptions: turnProviderOptions(provider, model, level),
    ...temperatureFor(provider),
  });

  const stream = toUIMessageStream({
    stream: result.stream,
    tools,
    originalMessages: run.messages,
    generateMessageId: newId,
    messageMetadata: ({ part }) => (part.type === 'start' ? { threadId: run.threadId } : undefined),
    onError: (error) => describeProviderError(provider, model, error, apiKey),
    onEnd: ({ responseMessage }) => {
      reply = abortSignal.aborted ? stoppedReply(responseMessage) : responseMessage;
    },
  });

  return { stream, reply: () => reply };
};

const firstText = (messages: UIMessage[]) =>
  messages
    .find((message) => message.role === 'user')
    ?.parts.flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join(' ')
    .trim()
    .slice(0, 2000) ?? '';

const cleanTitle = (text: string) =>
  text
    .replace(/^["'`\s]+|["'`.\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, TITLE_LIMIT);

export const generateTitle = async (run: Run) => {
  const prompt = firstText(run.messages);

  if (!prompt) return null;

  const { provider, apiKey } = run;

  const { text } = await generateText({
    model: createModel(provider, modelOf(run), apiKey),
    instructions: TITLE_INSTRUCTIONS,
    prompt,
    abortSignal: AbortSignal.timeout(30_000),
    ...shortAnswer(provider, 64),
  });

  return cleanTitle(text) || null;
};
