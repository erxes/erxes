import type { UIMessage } from 'ai';
import { z } from 'zod';
import {
  AGENT_REFERENCE_TYPES,
  type IAgentReference,
} from './parseAgentReferences';
import { decodeAgentPagePath } from './referencePagePath';

export interface IAgentReferenceEvidence extends IAgentReference {
  handle?: string;
}
export interface IAgentReferenceRegistry {
  key: string;
  byHandle: ReadonlyMap<string, IAgentReference>;
  byIdentity: ReadonlyMap<string, IAgentReference>;
}
const itemSchema = z.object({
  handle: z.string().uuid(),
  type: z.enum(AGENT_REFERENCE_TYPES),
  id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  label: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .refine((label) => !/[[\]\r\n]/.test(label)),
  path: z.string().max(200).optional(),
});
export const referenceIdentity = (reference: IAgentReference) =>
  `${reference.type}:${reference.id}`;
export const EMPTY_REFERENCE_REGISTRY: IAgentReferenceRegistry = {
  key: '[]',
  byHandle: new Map(),
  byIdentity: new Map(),
};
const validPage = (item: IAgentReference) =>
  item.type !== 'page' ||
  (item.path !== undefined && item.path === decodeAgentPagePath(item.id));
const recordOf = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
/** Authority comes ONLY from the named native tool output. Never scan prose,
 * user messages, tool inputs, artifacts, or fields nested inside returned data. */
export const readAgentReferenceEvidence = (
  message: UIMessage,
): IAgentReferenceEvidence[] => {
  if (message.role !== 'assistant') return [];
  const evidence: IAgentReferenceEvidence[] = [];
  for (const part of message.parts) {
    if (
      !(part.type === 'dynamic-tool' || part.type.startsWith('tool-')) ||
      !('state' in part) ||
      part.state !== 'output-available' ||
      !('output' in part)
    )
      continue;
    const name = 'toolName' in part ? part.toolName : part.type.slice(5);
    if (
      name !== 'callGraphql' &&
      name !== 'findPages' &&
      name !== 'execute_typescript'
    )
      continue;
    const output = recordOf(part.output);
    if (
      !output ||
      (name === 'callGraphql' && output.status !== 'ok') ||
      (name === 'execute_typescript' && output.success !== true)
    )
      continue;
    if ('referenceManifest' in output) {
      const manifest = z
        .object({
          version: z.literal(1),
          items: z
            .array(itemSchema)
            .max(name === 'execute_typescript' ? 250 : 25),
        })
        .safeParse(output.referenceManifest);
      if (manifest.success)
        evidence.push(...manifest.data.items.filter(validPage));
      continue;
    }
    // Old history remains readable, but unversioned tokens are not proof.
  }
  return evidence;
};
export const createAgentReferenceRegistry = (
  evidence: IAgentReferenceEvidence[],
): IAgentReferenceRegistry => {
  const byHandle = new Map<string, IAgentReference>();
  const byIdentity = new Map<string, IAgentReference>();
  const conflicts = new Set<string>();
  for (const { handle, ...reference } of evidence) {
    if (!validPage(reference)) continue;
    byIdentity.set(referenceIdentity(reference), reference);
    if (!handle || conflicts.has(handle)) continue;
    const previous = byHandle.get(handle);
    if (
      previous &&
      referenceIdentity(previous) !== referenceIdentity(reference)
    ) {
      byHandle.delete(handle);
      conflicts.add(handle);
    } else byHandle.set(handle, reference);
  }
  return { key: JSON.stringify(evidence), byHandle, byIdentity };
};
/** Each message sees only evidence from that message and its preceding history. */
export const buildAgentReferenceScopes = (
  messages: UIMessage[],
): IAgentReferenceRegistry[] => {
  let all: IAgentReferenceEvidence[] = [];
  let registry = EMPTY_REFERENCE_REGISTRY;
  return messages.map((message) => {
    const added = readAgentReferenceEvidence(message);
    if (added.length) {
      all = [...all, ...added];
      registry = createAgentReferenceRegistry(all);
    }
    return registry;
  });
};
const HANDLE_PATTERN = /\[\[ref:([A-Za-z0-9_-]{1,64})\]\]/g;
/** Used only in renderable text nodes, never HTML attributes or destinations. */
export const bindAgentReferenceHandles = (
  text: string,
  registry: IAgentReferenceRegistry,
): string =>
  text.replace(HANDLE_PATTERN, (_raw, handle: string) => {
    const item = registry.byHandle.get(handle);
    if (!item) return 'Reference unavailable';
    return `[[${item.type}:${item.id}:${item.label}]]`;
  });

/** Standalone HTML files cannot resolve app handles. Export canonical text only. */
export const referenceNamesForHtmlExport = (
  html: string,
  registry: IAgentReferenceRegistry,
): string =>
  html.replace(HANDLE_PATTERN, (_raw, handle: string) => {
    const name =
      registry.byHandle.get(handle)?.label ?? 'Reference unavailable';
    return name.replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[character] ?? character),
    );
  });
