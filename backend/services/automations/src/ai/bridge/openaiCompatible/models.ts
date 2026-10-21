import { TAiBridgeListModelsInput } from '../types';
import { requestOpenAiCompatible } from './request';
import { TOpenAiCompatibleModelsResponse } from './types';

// Shorter than the agent turn timeout so the list query fits the worker's
// 10s reply window.
const LIST_MODELS_TIMEOUT_MS = 8000;

export const listOpenAiCompatibleModels = async ({
  connection,
  runtime,
}: TAiBridgeListModelsInput): Promise<string[] | null> => {
  try {
    const response =
      await requestOpenAiCompatible<TOpenAiCompatibleModelsResponse>({
        connection,
        runtime: { ...runtime, timeoutMs: LIST_MODELS_TIMEOUT_MS },
        path: '/models',
        method: 'GET',
      });

    const models = response.ok ? response.json?.data : undefined;

    if (!Array.isArray(models) || !models.length) {
      return null;
    }

    return models.map(({ id }) => id).filter(Boolean);
  } catch {
    return null;
  }
};
