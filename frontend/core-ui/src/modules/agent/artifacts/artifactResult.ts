import { z } from 'zod';
import { ARTIFACT_TYPES, type IArtifactResult } from './types';

const resultSchema = z.object({
  kind: z.literal('artifact'),
  version: z.literal(1),
  artifact: z
    .object({
      type: z.enum(ARTIFACT_TYPES),
      title: z.string().trim().min(1).max(100),
      filename: z
        .string()
        .min(1)
        .max(128)
        .regex(/^[^/\\\p{Cc}]+$/u),
      content: z.string().trim().min(1).max(500_000),
    })
    .refine((artifact) => artifact.filename.endsWith(`.${artifact.type}`)),
});

/** Only the versioned artifact-tool result is a file, regardless of reply text. */
export const readArtifactResult = (output: unknown): IArtifactResult | null => {
  const result = resultSchema.safeParse(output);
  return result.success ? result.data : null;
};
