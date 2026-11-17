import { z } from 'zod';
import snapshot from './modelsDev.snapshot.json' with { type: 'json' };

const ModelsDevModel = z.object({
  id: z.string(),
  name: z.string().optional(),
  reasoning: z.boolean(),
  reasoning_options: z
    .array(
      z.object({
        type: z.string(),
        values: z.array(z.string()).optional(),
        min: z.number().optional(),
        max: z.number().optional(),
      }),
    )
    .optional(),
  tool_call: z.boolean().optional(),
  modalities: z
    .object({ input: z.array(z.string()).optional(), output: z.array(z.string()).optional() })
    .optional(),
});

type ModelsDevModel = z.infer<typeof ModelsDevModel>;

const Snapshot = z.object({
  providers: z.record(
    z.string(),
    z.object({ modelsDevProvider: z.string(), models: z.record(z.string(), ModelsDevModel) }),
  ),
});

const SNAPSHOT = Snapshot.parse(snapshot);

export const findModelsDevModel = (provider: string, model: string) =>
  SNAPSHOT.providers[provider]?.models[model.trim()];

export const listModelsDevModels = (provider: string) =>
  Object.values(SNAPSHOT.providers[provider]?.models ?? {});
