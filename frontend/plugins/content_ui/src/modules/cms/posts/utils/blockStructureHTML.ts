import type { Block } from '@blocknote/core';

const BLOCK_STRUCTURE_ATTRIBUTE = 'data-erxes-editor-document';

const isValidBlocks = (blocks: unknown): blocks is Block[] =>
  Array.isArray(blocks) &&
  blocks.length > 0 &&
  blocks.every(
    (block) =>
      typeof block === 'object' &&
      block !== null &&
      'id' in block &&
      'type' in block,
  );

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
