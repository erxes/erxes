import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';
import { isUsableProviderModel } from '@/agents/modelCatalog';
import {
  describeUnreadableKey,
  getByokProviderLabel,
  readProviderErrorMessage,
  sanitizeProviderMessage,
} from '@/agents/providerModels';
import { MIN_ANTHROPIC_THINKING_BUDGET } from '@/agents/modelThinking';
import { createModelConfig, resolveModelConnection } from '@/agents/providers';

/** Provider model ids: letters, digits and `._:/@-`, at most 128 chars. */
const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,127}$/;

const PROBE_TIMEOUT_MS = 20_000;
/** OpenAI's Responses API rejects `max_output_tokens` below 16. */
const PROBE_OUTPUT_TOKENS = 16;
/**
 * kimi-code (Anthropic protocol) probes with the smallest thinking budget,
 * the same one the chat's minimal level uses, because some Kimi Code models
 * (k3.1-pro) reject requests with thinking disabled. Anthropic requires
 * max_tokens > budget_tokens.
 */
const KIMI_CODE_THINKING_BUDGET = MIN_ANTHROPIC_THINKING_BUDGET;

/** Chunks that only appear once the provider accepted the request. */
const ACCEPTED_CHUNK_TYPES = new Set([
  'response-metadata',
  'text-start',
  'text-delta',
  'reasoning-start',
  'reasoning-delta',
  'finish',
]);
const PROBE_CHUNK_LIMIT = 32;

export interface IAgentsModelProbeResult {
  ok: boolean;
  error: string | null;
}

/**
 * The slice of the AI SDK language-model contract the probe calls. Every
 * model Mastra resolves (V2–V4) and the kimi-code @ai-sdk/anthropic model
 * accept this call shape and throw `APICallError` on an HTTP failure.
 */
interface IProbeLanguageModel {
  doStream(options: {
    prompt: Array<{
      role: 'user';
      content: Array<{ type: 'text'; text: string }>;
    }>;
    maxOutputTokens: number;
    providerOptions?: Record<string, Record<string, unknown>>;
    abortSignal: AbortSignal;
  }): PromiseLike<{
    stream: ReadableStream<{ type: string; error?: unknown }>;
  }>;
}

const describeProbeFailure = (
  provider: string,
  model: string,
  error: unknown,
  apiKey: string,
): string => {
  const label = getByokProviderLabel(provider);
  const { statusCode, responseBody, message, name } = (error ?? {}) as {
    statusCode?: unknown;
    responseBody?: unknown;
    message?: unknown;
    name?: unknown;
  };

  if (name === 'TimeoutError' || name === 'AbortError') {
    return `${label} did not answer within ${
      PROBE_TIMEOUT_MS / 1000
    }s while checking "${model}". Try again.`;
  }
  let bodyMessage: unknown;

  try {
    bodyMessage =
      typeof responseBody === 'string'
        ? readProviderErrorMessage(JSON.parse(responseBody))
        : undefined;
  } catch {
    bodyMessage = undefined;
  }

  const detail = sanitizeProviderMessage(bodyMessage || message, apiKey);
  const status = typeof statusCode === 'number' ? ` (${statusCode})` : '';

  if (statusCode === 401) {
    return `${label} rejected the saved API key${status}. Re-enter it in Settings → API key.`;
  }

  return `${label} rejected "${model}"${status}${detail ? `: ${detail}` : '.'}`;
};

/**
 * Checks that one model id works for the user's saved connection with a
 * minimal request through the same client the chat uses (`providers.ts` →
 * Mastra model resolution). The response is discarded; the error is key-free.
 */
export const probeProviderModel = async ({
  connection,
  model,
}: {
  connection: IAiAgentConnection;
  model: string;
}): Promise<IAgentsModelProbeResult> => {
  const provider = connection.provider;
  const label = getByokProviderLabel(provider);

  if (!MODEL_ID_PATTERN.test(model)) {
    return {
      ok: false,
      error:
        'Enter a model id such as "gpt-6-luna" (letters, digits, . _ : / @ -).',
    };
  }

  if (!isUsableProviderModel(provider, model)) {
    return {
      ok: false,
      error: `"${model}" is not a chat model the assistant can use with ${label}.`,
    };
  }

  let resolved: ReturnType<typeof resolveModelConnection>;

  try {
    resolved = resolveModelConnection({ connection: { ...connection, model } });
  } catch {
    return {
      ok: false,
      error: describeUnreadableKey(provider, connection.config?.apiKey),
    };
  }

  try {
    // @mastra/core is ESM-only; load it dynamically from CommonJS.
    const { resolveModelConfig } = await import('@mastra/core/llm');
    const config = await createModelConfig(resolved);
    // External-library boundary: Mastra's resolved model union (V1–V4) is
    // narrowed to the call shape every non-legacy version shares.
    const languageModel = (await resolveModelConfig(
      config,
    )) as unknown as IProbeLanguageModel;
    const thinking = provider === 'kimi-code';
    const { stream } = await languageModel.doStream({
      prompt: [
        { role: 'user', content: [{ type: 'text', text: 'Reply with OK.' }] },
      ],
      maxOutputTokens: thinking
        ? KIMI_CODE_THINKING_BUDGET + PROBE_OUTPUT_TOKENS
        : PROBE_OUTPUT_TOKENS,
      ...(thinking
        ? {
            providerOptions: {
              anthropic: {
                thinking: {
                  type: 'enabled',
                  budgetTokens: KIMI_CODE_THINKING_BUDGET,
                },
              },
            },
          }
        : {}),
      abortSignal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    const reader = stream.getReader();
    let accepted = false;

    try {
      // Model output or metadata proves the model accepted the request; an
      // error chunk carries a rejection reported after the HTTP status.
      for (let index = 0; index < PROBE_CHUNK_LIMIT; index += 1) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        if (ACCEPTED_CHUNK_TYPES.has(value.type)) {
          accepted = true;
          break;
        }

        if (value.type === 'error') {
          return {
            ok: false,
            error: describeProbeFailure(
              provider,
              model,
              value.error,
              resolved.apiKey,
            ),
          };
        }
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }

    // A stream that ends (or stalls) without any of those proves nothing.
    return accepted
      ? { ok: true, error: null }
      : {
          ok: false,
          error: `${label} sent no response while checking "${model}". Try again.`,
        };
  } catch (error: unknown) {
    return {
      ok: false,
      error: describeProbeFailure(provider, model, error, resolved.apiKey),
    };
  }
};
