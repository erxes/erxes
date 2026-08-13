import type { BLOCK_SCHEMA } from 'erxes-ui';

const BLOCK_STRUCTURE_ATTRIBUTE = 'data-erxes-editor-document';

type CmsEditorBlock = typeof BLOCK_SCHEMA.Block;

const SUPPORTED_BLOCK_TYPES: ReadonlySet<string> = new Set([
  'paragraph',
  'heading',
  'quote',
  'codeBlock',
  'toggleListItem',
  'bulletListItem',
  'numberedListItem',
  'checkListItem',
  'table',
  'file',
  'image',
  'video',
  'audio',
  'gallery',
  'documentPlaceholder',
]);

const isValidBlock = (block: unknown): block is CmsEditorBlock => {
  if (typeof block !== 'object' || block === null) {
    return false;
  }

  if (!('id' in block) || typeof block.id !== 'string' || !block.id.trim()) {
    return false;
  }

  if (
    !('type' in block) ||
    typeof block.type !== 'string' ||
    !SUPPORTED_BLOCK_TYPES.has(block.type)
  ) {
    return false;
  }

  if (
    'children' in block &&
    (!Array.isArray(block.children) || !block.children.every(isValidBlock))
  ) {
    return false;
  }

  return true;
};

const isValidBlocks = (blocks: unknown): blocks is CmsEditorBlock[] =>
  Array.isArray(blocks) && blocks.length > 0 && blocks.every(isValidBlock);

const encodeUtf8Base64 = (value: string): string => {
  const binary = encodeURIComponent(value).replace(
    /%([0-9A-F]{2})/g,
    (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)),
  );

  return btoa(binary);
};

const decodeUtf8Base64 = (value: string): string => {
  const binary = atob(value);
  const encoded = Array.from(
    binary,
    (character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`,
  ).join('');

  return decodeURIComponent(encoded);
};

export const embedBlockStructureInHTML = (
  html: string,
  blocks: unknown[],
): string => {
  const encodedBlocks = encodeUtf8Base64(JSON.stringify(blocks));

  return `<div ${BLOCK_STRUCTURE_ATTRIBUTE}="${encodedBlocks}">${html}</div>`;
};

export const parseBlockStructureFromHTML = (html: string) => {
  if (!html.includes(BLOCK_STRUCTURE_ATTRIBUTE)) {
    return undefined;
  }

  try {
    const document = new DOMParser().parseFromString(html, 'text/html');
    const encodedBlocks = document
      .querySelector(`[${BLOCK_STRUCTURE_ATTRIBUTE}]`)
      ?.getAttribute(BLOCK_STRUCTURE_ATTRIBUTE);

    if (!encodedBlocks) {
      return undefined;
    }

    const blocks: unknown = JSON.parse(decodeUtf8Base64(encodedBlocks));

    return isValidBlocks(blocks) ? blocks : undefined;
  } catch {
    return undefined;
  }
};
