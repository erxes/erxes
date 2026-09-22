const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const WORDPRESS_TABLE_FIGURE_PATTERN =
  /<figure\b(?=[^>]*\bclass\s*=\s*(?:"[^"]*\bwp-block-table\b[^"]*"|'[^']*\bwp-block-table\b[^']*'|[^\s>]*\bwp-block-table\b[^\s>]*))[^>]*>([\s\S]*?)<\/figure>/gi;
const HTML_OPENING_TAG_PATTERN = /<[a-z][^<>]*>/gi;
const CLASS_ATTRIBUTE_PATTERN = /\s+class\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const stripClassAttribute = (tag: string): string =>
  tag.replace(CLASS_ATTRIBUTE_PATTERN, '');

/**
 * Converts WordPress block markup into plain semantic HTML for erxes CMS.
 *
 * Gutenberg comments and WordPress-specific presentation classes are not part
 * of the CMS content contract. Table figures are unwrapped so the table remains
 * a direct semantic element that erxes editors and renderers can consume.
 */
export const normalizeWordPressContent = (content: string): string =>
  content
    .replace(HTML_COMMENT_PATTERN, '')
    .replace(WORDPRESS_TABLE_FIGURE_PATTERN, '$1')
    .replace(HTML_OPENING_TAG_PATTERN, stripClassAttribute)
    .trim();
