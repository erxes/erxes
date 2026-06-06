import { TAiBridgeHealthInput, TAiBridgeHealthResult } from '../types';
import { TOpenAiCompatibleModelsResponse } from './types';
import {
  buildOpenAiCompatibleChatBody,
  formatOpenAiCompatibleError,
  requestOpenAiCompatible,
} from './request';

const createHealthResult = (): TAiBridgeHealthResult => ({
  ready: false,
  errors: [],
  warnings: [],
  checks: {
    credentials: 'skipped',
    endpoint: 'skipped',
    model: 'skipped',
  },
});

const looksLikeModelError = (message: string) => {
  const lowered = message.toLowerCase();

  return (
    lowered.includes('model') &&
    (lowered.includes('not found') ||
      lowered.includes('does not exist') ||
      lowered.includes('unsupported') ||
      lowered.includes('invalid'))
  );
};

const checkUsingChatCompletion = async (
  input: TAiBridgeHealthInput,
): Promise<TAiBridgeHealthResult> => {
  const result = createHealthResult();

  const response = await requestOpenAiCompatible({
    connection: input.connection,
    runtime: input.runtime,
    path: '/chat/completions',
    method: 'POST',
    body: buildOpenAiCompatibleChatBody({
      connection: input.connection,
      runtime: {
        ...input.runtime,
        temperature: 1,
        maxTokens: 1,
      },
      messages: [{ role: 'user', content: 'ping' }],
    }),
  });

  if (response.ok) {
    result.ready = true;
    result.checks.credentials = 'ok';
    result.checks.endpoint = 'ok';
    result.checks.model = 'ok';
    return result;
  }

  if ([401, 403].includes(response.status)) {
    result.checks.credentials = 'error';
    result.checks.endpoint = 'ok';
    result.errors.push('AI provider credentials were rejected.');
    return result;
  }

  if (response.status === 404) {
    result.checks.endpoint = 'error';
    result.errors.push(
      'AI provider endpoint is not reachable at this base URL.',
    );
    return result;
  }

  if (looksLikeModelError(response.text)) {
    result.checks.credentials = 'ok';
    result.checks.endpoint = 'ok';
    result.checks.model = 'error';
    result.errors.push(
      `AI model "${input.connection.model}" is not available on this provider.`,
    );
    return result;
  }

  result.checks.credentials = 'warning';
  result.checks.endpoint = 'warning';
  result.warnings.push(formatOpenAiCompatibleError(response));

  return result;
};

export const checkOpenAiCompatibleHealth = async (
  input: TAiBridgeHealthInput,
): Promise<TAiBridgeHealthResult> => {
  const result = createHealthResult();

  try {
    const response =
      await requestOpenAiCompatible<TOpenAiCompatibleModelsResponse>({
        connection: input.connection,
        runtime: input.runtime,
        path: '/models',
        method: 'GET',
      });

    if (response.ok) {
      result.checks.credentials = 'ok';
      result.checks.endpoint = 'ok';

      const models = response.json?.data || [];

      if (!Array.isArray(models) || models.length === 0) {
        result.checks.model = 'warning';
        result.warnings.push(
          'Provider health succeeded, but the model list was empty or unavailable.',
        );
        result.ready = true;
        return result;
      }

      const hasModel = models.some(({ id }) => id === input.connection.model);

      if (hasModel) {
        result.checks.model = 'ok';
        result.ready = true;
        return result;
      }

      result.checks.model = 'error';
      result.errors.push(
        `AI model "${input.connection.model}" was not found in the provider model list.`,
      );
      return result;
    }

    if ([401, 403].includes(response.status)) {
      result.checks.credentials = 'error';
      result.checks.endpoint = 'ok';
      result.errors.push('AI provider credentials were rejected.');
      return result;
    }

    if (response.status === 404) {
      return await checkUsingChatCompletion(input);
    }

    result.warnings.push(formatOpenAiCompatibleError(response));

    return await checkUsingChatCompletion(input);
  } catch (error) {
    result.checks.endpoint = 'error';
    result.errors.push(
      `AI provider health check failed: ${(error as Error).message}`,
    );
    return result;
  }
};
