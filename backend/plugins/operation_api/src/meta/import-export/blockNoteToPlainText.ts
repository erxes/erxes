/**
 * Helper to check if an object has a MongoDB ObjectId-like toHexString method.
 */
function hasToHexString(value: object): value is { toHexString: () => string } {
  return 'toHexString' in value && typeof (value as Record<string, unknown>).toHexString === 'function';
}

/**
 * Extracts and formats string values from object representations.
 */
function handleObjectValue(value: object): string {
  if (hasToHexString(value)) {
    return value.toHexString();
  }

  if (!isBlockNote(value) && !(Array.isArray(value) && value.length === 0)) {
    const toStringFn = value.toString;
    if (typeof toStringFn === 'function' && toStringFn !== Object.prototype.toString) {
      return toStringFn.call(value);
    }
    return JSON.stringify(value);
  }

  const blocks = Array.isArray(value) ? value : [value];
  return extractBlocksText(blocks).trim();
}

/**
 * Attempts to parse a raw string value as BlockNote JSON and extract text,
 * falling back to the raw string if not valid BlockNote JSON.
 */
function handleStringValue(raw: string): string {
  if (!raw.trim()) {
    return '';
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    return raw;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isBlockNote(parsed) && !(Array.isArray(parsed) && parsed.length === 0)) {
      return raw;
    }
    const blocks = Array.isArray(parsed) ? parsed : [parsed];
    return extractBlocksText(blocks).trim();
  } catch {
    return raw;
  }
}

/**
 * Converts a BlockNote JSON string (or already-plain text) to plain text.
 *
 * BlockNote stores rich text as a JSON array of block nodes, e.g.:
 * [{ "type": "paragraph", "content": [{ "type": "text", "text": "Hello" }], "children": [] }]
 *
 * This function extracts all text from those nodes recursively.
 * If the value is not valid JSON it is returned as-is.
 */
export function blockNoteToPlainText(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return handleObjectValue(value);
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return String(value);
  }

  if (typeof value === 'string') {
    return handleStringValue(value);
  }

  return '';
}

/** Recursively extracts plain text from an array of BlockNote block nodes. */
function extractBlocksText(blocks: unknown[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;

    const node = block as Record<string, unknown>;
    const line = extractInlineText(
      Array.isArray(node.content) ? (node.content as unknown[]) : [],
    );
    if (line) lines.push(line);

    // Recurse into children (nested blocks)
    if (Array.isArray(node.children) && node.children.length > 0) {
      const childText = extractBlocksText(node.children as unknown[]);
      if (childText) lines.push(childText);
    }
  }

  return lines.join('\n');
}

/** Extracts plain text from an array of BlockNote inline content nodes. */
function extractInlineText(content: unknown[]): string {
  if (!Array.isArray(content)) return '';

  return content
    .map((item) => {
      if (!item || typeof item !== 'object') return '';

      const node = item as Record<string, unknown>;

      switch (node.type) {
        case 'text':
          return typeof node.text === 'string' ? node.text : '';
        case 'link': {
          const contentArray = Array.isArray(node.content) ? (node.content as unknown[]) : [];
          return extractInlineText(contentArray);
        }
        default: {
          if (typeof node.text === 'string') {
            return node.text;
          }
          const contentArray = Array.isArray(node.content) ? (node.content as unknown[]) : [];
          return extractInlineText(contentArray);
        }
      }
    })
    .join('');
}

/**
 * Helper to determine if an object/array represents BlockNote blocks.
 */
function isBlockNote(parsed: unknown): boolean {
  if (Array.isArray(parsed)) {
    return parsed.some(
      (item) => typeof item === 'object' && item !== null && 'type' in item,
    );
  }
  return typeof parsed === 'object' && parsed !== null && 'type' in parsed;
}

