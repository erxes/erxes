import { Block } from '@blocknote/core';
import { parseBlocks } from './parseBlocks';

const BLOCK_STRUCTURE_ATTRIBUTE = 'data-erxes-editor-document';

const encodeUtf8Base64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

const decodeUtf8Base64 = (value: string): string => {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

/**
 * Keeps BlockNote's non-lossy document structure alongside interoperable HTML.
 * The data attribute is inert when the HTML is rendered by a CMS consumer.
 */
export const embedBlockStructureInHTML = (
  html: string,
  blocks: Block[],
): string => {
  const encodedBlocks = encodeUtf8Base64(JSON.stringify(blocks));

  return `<div ${BLOCK_STRUCTURE_ATTRIBUTE}="${encodedBlocks}">${html}</div>`;
};

/**
 * Reads editor structure previously embedded by embedBlockStructureInHTML.
 * Invalid or legacy HTML falls back to BlockNote's regular HTML parser.
 */
export const parseBlockStructureFromHTML = (
  html: string,
): Block[] | undefined => {
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

    return parseBlocks(decodeUtf8Base64(encodedBlocks)) || undefined;
  } catch {
    return undefined;
  }
};
