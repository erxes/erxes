import { z } from 'zod';
import { AGENTS_REFERENCE_RESOLVE_URL } from '../api';
import {
  AGENT_REFERENCE_TYPES,
  type IAgentReference,
} from './parseAgentReferences';

const resolvedSchema = z.object({
  reference: z.object({
    type: z.enum(AGENT_REFERENCE_TYPES),
    id: z.string(),
    label: z.string().min(1).max(80),
    location: z
      .object({
        boardId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
        pipelineId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
      })
      .optional(),
  }),
});
/** This is an ordinary authenticated read; no BYOK/model call or guessed URL. */
export const resolveAgentReference = async (reference: IAgentReference) => {
  const response = await fetch(AGENTS_REFERENCE_RESOLVE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ type: reference.type, id: reference.id }),
  });
  if (!response.ok)
    throw new Error('This record is unavailable or you no longer have access.');
  const parsed = resolvedSchema.safeParse(await response.json());
  if (
    !parsed.success ||
    parsed.data.reference.type !== reference.type ||
    parsed.data.reference.id !== reference.id
  )
    throw new Error('Could not verify this record.');
  return parsed.data.reference;
};
