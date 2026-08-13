import { BLOCK_SCHEMA } from 'erxes-ui';

const BLOCK_STRUCTURE_ATTRIBUTE = 'data-erxes-editor-document';

type CmsEditorBlock = typeof BLOCK_SCHEMA.Block;

const BLOCK_CONFIGS: Record<string, unknown> = BLOCK_SCHEMA.blockSchema;
const INLINE_CONTENT_CONFIGS: Record<string, unknown> =
  BLOCK_SCHEMA.inlineContentSchema;
const STYLE_CONFIGS: Record<string, unknown> = BLOCK_SCHEMA.styleSchema;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidPropValue = (value: unknown, spec: unknown): boolean => {
  if (!isRecord(spec)) {
    return false;
  }

  if (value === undefined) {
    return spec.default === undefined;
  }

  const expectedType =
    spec.default === undefined ? spec.type : typeof spec.default;

  if (typeof value !== expectedType) {
    return false;
  }

  return (
    spec.values === undefined ||
    (Array.isArray(spec.values) &&
      spec.values.some((allowedValue) => allowedValue === value))
  );
};

const isValidProps = (props: unknown, schema: unknown): boolean => {
  if (!isRecord(props) || !isRecord(schema)) {
    return false;
  }

  return (
    Object.keys(props).every((name) => name in schema) &&
    Object.entries(schema).every(([name, spec]) =>
      isValidPropValue(props[name], spec),
    )
  );
};

const isValidStyles = (styles: unknown): boolean =>
  isRecord(styles) &&
  Object.entries(styles).every(([name, value]) => {
    const config = STYLE_CONFIGS[name];

    return isRecord(config) && typeof value === config.propSchema;
  });

const isValidStyledText = (content: unknown): boolean =>
  isRecord(content) &&
  content.type === 'text' &&
  typeof content.text === 'string' &&
  isValidStyles(content.styles);

const isValidInlineContent = (content: unknown): boolean => {
  if (!isRecord(content) || typeof content.type !== 'string') {
    return false;
  }

  if (content.type === 'text') {
    return isValidStyledText(content);
  }

  if (content.type === 'link') {
    return (
      typeof content.href === 'string' &&
      Array.isArray(content.content) &&
      content.content.every(isValidStyledText)
    );
  }

  const config = INLINE_CONTENT_CONFIGS[content.type];

  if (!isRecord(config) || !isValidProps(content.props, config.propSchema)) {
    return false;
  }

  if (config.content === 'none') {
    return content.content === undefined;
  }

  return (
    config.content === 'styled' &&
    Array.isArray(content.content) &&
    content.content.every(isValidStyledText)
  );
};

const isValidTableCell = (cell: unknown): boolean => {
  if (Array.isArray(cell)) {
    return cell.every(isValidInlineContent);
  }

  if (!isRecord(cell) || cell.type !== 'tableCell') {
    return false;
  }

  const { props } = cell;

  return (
    isRecord(props) &&
    typeof props.backgroundColor === 'string' &&
    typeof props.textColor === 'string' &&
    ['left', 'center', 'right', 'justify'].includes(
      String(props.textAlignment),
    ) &&
    (props.colspan === undefined || typeof props.colspan === 'number') &&
    (props.rowspan === undefined || typeof props.rowspan === 'number') &&
    Array.isArray(cell.content) &&
    cell.content.every(isValidInlineContent)
  );
};

const isValidTableContent = (content: unknown): boolean =>
  isRecord(content) &&
  content.type === 'tableContent' &&
  Array.isArray(content.columnWidths) &&
  content.columnWidths.every(
    (width) => width === undefined || typeof width === 'number',
  ) &&
  (content.headerRows === undefined ||
    typeof content.headerRows === 'number') &&
  (content.headerCols === undefined ||
    typeof content.headerCols === 'number') &&
  Array.isArray(content.rows) &&
  content.rows.every(
    (row) =>
      isRecord(row) &&
      Array.isArray(row.cells) &&
      row.cells.every(isValidTableCell),
  );

const isValidBlockContent = (
  content: unknown,
  contentType: unknown,
): boolean => {
  if (contentType === 'none') {
    return content === undefined;
  }

  if (contentType === 'inline') {
    return Array.isArray(content) && content.every(isValidInlineContent);
  }

  return contentType === 'table' && isValidTableContent(content);
};

const isValidBlock = (block: unknown): block is CmsEditorBlock => {
  if (!isRecord(block)) {
    return false;
  }

  if (!('id' in block) || typeof block.id !== 'string' || !block.id.trim()) {
    return false;
  }

  if (typeof block.type !== 'string') {
    return false;
  }

  const config = BLOCK_CONFIGS[block.type];

  if (
    !isRecord(config) ||
    !isValidProps(block.props, config.propSchema) ||
    !isValidBlockContent(block.content, config.content) ||
    !Array.isArray(block.children) ||
    !block.children.every(isValidBlock)
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
    (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)),
  );

  return btoa(binary);
};

const decodeUtf8Base64 = (value: string): string => {
  const binary = atob(value);
  const encoded = Array.from(
    binary,
    (character) =>
      `%${(character.codePointAt(0) ?? 0).toString(16).padStart(2, '0')}`,
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
