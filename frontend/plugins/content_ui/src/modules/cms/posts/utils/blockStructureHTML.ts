import { BLOCK_SCHEMA } from 'erxes-ui';

const BLOCK_STRUCTURE_ATTRIBUTE = 'data-erxes-editor-document';

type CmsEditorBlock = typeof BLOCK_SCHEMA.Block;

const BLOCK_CONFIGS: Record<string, unknown> = BLOCK_SCHEMA.blockSchema;
const INLINE_CONTENT_CONFIGS: Record<string, unknown> =
  BLOCK_SCHEMA.inlineContentSchema;
const STYLE_CONFIGS: Record<string, unknown> = BLOCK_SCHEMA.styleSchema;

/** Checks whether an unknown value is a non-array object. */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Validates one property value against a BlockNote property specification. */
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

/** Validates a complete property object against its BlockNote schema. */
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

/** Validates the styles attached to a text node. */
const isValidStyles = (styles: unknown): boolean =>
  isRecord(styles) &&
  Object.entries(styles).every(([name, value]) => {
    const config = STYLE_CONFIGS[name];

    return isRecord(config) && typeof value === config.propSchema;
  });

/** Validates a BlockNote styled-text node. */
const isValidStyledText = (content: unknown): boolean =>
  isRecord(content) &&
  content.type === 'text' &&
  typeof content.text === 'string' &&
  isValidStyles(content.styles);

/** Validates text, link, and custom inline content. */
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

/** Validates either a legacy inline table cell or a structured table cell. */
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

/** Validates the rows, cells, and metadata in table block content. */
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

/** Validates content according to a block type's declared content mode. */
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

/** Validates one embedded editor block and all of its descendants. */
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

  return (
    isRecord(config) &&
    isValidProps(block.props, config.propSchema) &&
    isValidBlockContent(block.content, config.content) &&
    Array.isArray(block.children) &&
    block.children.every(isValidBlock)
  );
};

/** Validates a non-empty embedded BlockNote document. */
const isValidBlocks = (blocks: unknown): blocks is CmsEditorBlock[] =>
  Array.isArray(blocks) && blocks.length > 0 && blocks.every(isValidBlock);

/** Encodes a UTF-8 string as browser-compatible Base64. */
const encodeUtf8Base64 = (value: string): string => {
  const binary = encodeURIComponent(value).replace(
    /%([0-9A-F]{2})/g,
    (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)),
  );

  return btoa(binary);
};

/** Decodes browser-compatible Base64 into a UTF-8 string. */
const decodeUtf8Base64 = (value: string): string => {
  const binary = atob(value);
  const encoded = Array.from(
    binary,
    (character) =>
      `%${(character.codePointAt(0) ?? 0).toString(16).padStart(2, '0')}`,
  ).join('');

  return decodeURIComponent(encoded);
};

/** Embeds a lossless editor document alongside its public HTML. */
export const embedBlockStructureInHTML = (
  html: string,
  blocks: unknown[],
): string => {
  const encodedBlocks = encodeUtf8Base64(JSON.stringify(blocks));

  return `<div ${BLOCK_STRUCTURE_ATTRIBUTE}="${encodedBlocks}">${html}</div>`;
};

/** Restores a valid embedded editor document from saved CMS HTML. */
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
