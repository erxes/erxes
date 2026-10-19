import { randomUUID } from 'crypto';

/**
 * Clickable record references for the chat agent.
 *
 * `callGraphql` results carry a `references` list of tokens the model may copy
 * verbatim into its reply; the UI renders each `[[type:id:label]]` token as a
 * link to that record. The model never invents tokens — it only reuses the
 * ones returned here, so extraction is deliberately conservative: only known
 * record types, only documents carrying a well-formed `_id`, labels capped and
 * sanitized.
 */

/** The fixed set of reference types; also the pageContext `record.type` set. */
export const AGENT_REFERENCE_TYPES = [
  'customer',
  'company',
  'user',
  'product',
  'branch',
  'department',
  'unit',
  'brand',
  'deal',
  'conversation',
] as const;

export type IAgentReferenceType = (typeof AGENT_REFERENCE_TYPES)[number];

export const isAgentReferenceType = (
  value: unknown,
): value is IAgentReferenceType =>
  typeof value === 'string' &&
  (AGENT_REFERENCE_TYPES as readonly string[]).includes(value);

/** Ids that may appear inside a token (and in pageContext record ids). */
export const AGENT_REFERENCE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

const MAX_REFERENCES = 25;
const MAX_LABEL_LENGTH = 80;
const CONVERSATION_SNIPPET_LENGTH = 40;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const stringField = (
  doc: Record<string, unknown>,
  field: string,
): string | undefined => {
  const value = doc[field];

  return typeof value === 'string' && value.trim() ? value : undefined;
};

/**
 * Per-type label pickers: ordered field candidates, first non-empty wins.
 * Returning undefined falls back to the record id.
 */
const LABEL_PICKERS: Record<
  IAgentReferenceType,
  (doc: Record<string, unknown>) => string | undefined
> = {
  customer: (doc) => {
    const name = [doc.firstName, doc.lastName]
      .filter((part): part is string => typeof part === 'string')
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ');

    return (
      (name || undefined) ??
      stringField(doc, 'primaryEmail') ??
      stringField(doc, 'primaryPhone') ??
      stringField(doc, 'code')
    );
  },
  company: (doc) => {
    const names = doc.names;

    return (
      stringField(doc, 'primaryName') ??
      (Array.isArray(names) && typeof names[0] === 'string' && names[0].trim()
        ? names[0]
        : undefined) ??
      stringField(doc, 'primaryEmail')
    );
  },
  user: (doc) => {
    const details = isRecord(doc.details) ? doc.details : undefined;

    return (
      (details ? stringField(details, 'fullName') : undefined) ??
      stringField(doc, 'username') ??
      stringField(doc, 'email')
    );
  },
  product: (doc) => stringField(doc, 'name') ?? stringField(doc, 'code'),
  branch: (doc) => stringField(doc, 'title') ?? stringField(doc, 'code'),
  department: (doc) => stringField(doc, 'title') ?? stringField(doc, 'code'),
  unit: (doc) => stringField(doc, 'title') ?? stringField(doc, 'code'),
  brand: (doc) => stringField(doc, 'name'),
  deal: (doc) => stringField(doc, 'name'),
  // Conversation rows carry no customer name; a short content snippet or the
  // bare id is the most truthful label.
  conversation: (doc) => {
    const content = stringField(doc, 'content');

    return content ? content.slice(0, CONVERSATION_SNIPPET_LENGTH) : undefined;
  },
};

/**
 * Token types that may appear in assistant text: the record types plus
 * `page`, emitted only by `findPages` (its id is a base64url-encoded
 * client path — never an `_id` and never a pageContext `record.type`).
 */
export const AGENT_REFERENCE_TOKEN_TYPES = [
  ...AGENT_REFERENCE_TYPES,
  'page',
] as const;

/**
 * Sanitizes a label for token emission: strips the token's own delimiters
 * and newlines, collapses whitespace, caps the length. An empty result
 * means "use the id as the label".
 */
export const sanitizeLabel = (value: string): string =>
  value
    .replace(/[[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LABEL_LENGTH)
    .trim();

/**
 * Collects candidate documents from a tool result. Handles a bare document,
 * an array of documents, and common one-level list wrappers (`list`,
 * `items`, `data` holding an array or a document).
 */
const collectDocuments = (result: unknown): Record<string, unknown>[] => {
  const docs: Record<string, unknown>[] = [];
  const push = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isRecord(item)) {
          docs.push(item);
        }
      }
      return;
    }

    if (isRecord(value)) {
      docs.push(value);
    }
  };

  if (Array.isArray(result)) {
    push(result);
    return docs;
  }

  if (!isRecord(result)) {
    return docs;
  }

  if (typeof result._id === 'string') {
    docs.push(result);
    return docs;
  }

  for (const key of ['list', 'items', 'data']) {
    push(result[key]);
  }

  return docs;
};

/**
 * Extracts `[[type:id:label]]` reference tokens from a tool call result.
 * Unknown record types produce none. Records without a well-formed string `_id`
 * are skipped. Tokens are unique and capped at MAX_REFERENCES.
 */
export const extractAgentReferences = (
  type: string,
  result: unknown,
): string[] => {
  if (!isAgentReferenceType(type)) {
    return [];
  }

  const pickLabel = LABEL_PICKERS[type];
  const tokens: string[] = [];
  const seen = new Set<string>();

  for (const doc of collectDocuments(result)) {
    const id = doc._id;

    if (typeof id !== 'string' || !AGENT_REFERENCE_ID_RE.test(id)) {
      continue;
    }

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    const label = sanitizeLabel(pickLabel(doc) ?? '') || id;

    tokens.push(`[[${type}:${id}:${label}]]`);

    if (tokens.length >= MAX_REFERENCES) {
      break;
    }
  }

  return tokens;
};

/** Native tool-result metadata, persisted by Mastra with the result. The model
 * receives the token to copy; only this manifest can authorize a clickable chip. */
export interface IAgentsIssuedReference {
  handle: string;
  type: IAgentReferenceType | 'page';
  id: string;
  label: string;
  path?: string;
}
export const issueAgentReferences = (
  tokens: string[],
): {
  references: string[];
  referenceManifest: { version: 1; items: IAgentsIssuedReference[] };
} => {
  const items: IAgentsIssuedReference[] = [];
  for (const token of tokens.slice(0, MAX_REFERENCES)) {
    const match =
      /^\[\[([a-z]+):([A-Za-z0-9_-]{1,64}):([^[\]\r\n]+)\]\]$/.exec(token);
    if (!match || (!isAgentReferenceType(match[1]) && match[1] !== 'page'))
      continue;
    const type = match[1] as IAgentsIssuedReference['type'];
    let path: string | undefined;
    if (type === 'page') {
      path = Buffer.from(match[2], 'base64url').toString('utf8');
      if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
        continue;
    }
    items.push({
      handle: randomUUID(),
      type,
      id: match[2],
      label: sanitizeLabel(match[3]),
      ...(path ? { path } : {}),
    });
  }
  return {
    references: items.map((item) => `[[ref:${item.handle}]]`),
    referenceManifest: { version: 1, items },
  };
};
