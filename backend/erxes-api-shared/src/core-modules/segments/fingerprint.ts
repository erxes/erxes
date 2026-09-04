import { SegmentNode } from './nodes';

const stable = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${stable(entry)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value ?? null);
};

export const canonicalSegmentNode = (node: SegmentNode): SegmentNode => {
  if (node.kind === 'field' && node.meta) {
    const { meta: _picker, ...asked } = node;

    return asked;
  }

  if (node.kind !== 'group') {
    return node;
  }

  const children = node.children
    .map(canonicalSegmentNode)
    .filter((child) => child.kind !== 'group' || child.children.length > 0)
    .sort((left, right) => stable(left).localeCompare(stable(right)));

  if (children.length === 1) {
    return children[0];
  }

  return { ...node, children };
};

export const canonicalSegmentText = (
  contentType: string,
  root: SegmentNode,
): string => `${contentType}|${stable(canonicalSegmentNode(root))}`;

export const segmentFingerprint = (
  contentType: string,
  root: SegmentNode,
): string => {
  const source = canonicalSegmentText(contentType, root);
  let hash = 0x811c9dc5;

  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
};

export const sameSegmentDefinition = (
  contentType: string,
  left: SegmentNode,
  right: SegmentNode,
): boolean =>
  canonicalSegmentText(contentType, left) ===
  canonicalSegmentText(contentType, right);
