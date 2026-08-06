import { readFile, stat } from 'node:fs/promises';

import { XMLParser, XMLValidator } from 'fast-xml-parser';

import {
  WordPressAuthor,
  WordPressExport,
  WordPressItem,
  WordPressTaxonomyReference,
  WordPressTerm,
} from './types';

type XmlRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is XmlRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asArray = (value: unknown): unknown[] => {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const readText = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (isRecord(value)) {
    return readText(value['#text']);
  }

  return '';
};

const readNumber = (value: unknown): number => {
  const parsed = Number.parseInt(readText(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readRecord = (value: unknown, description: string): XmlRecord => {
  if (!isRecord(value)) {
    throw new Error(`Invalid WXR: ${description} is missing or malformed.`);
  }

  return value;
};

const parseAuthor = (value: unknown): WordPressAuthor => {
  const author = readRecord(value, 'wp:author');

  return {
    id: readText(author['wp:author_id']),
    login: readText(author['wp:author_login']),
    email: readText(author['wp:author_email']),
    displayName: readText(author['wp:author_display_name']),
    firstName: readText(author['wp:author_first_name']),
    lastName: readText(author['wp:author_last_name']),
  };
};

const parseTermRecord = (
  value: unknown,
  taxonomy: string,
  fieldPrefix: 'category' | 'tag' | 'term',
): WordPressTerm => {
  const term = readRecord(value, `wp:${fieldPrefix}`);
  const key = (suffix: string): string => `wp:${fieldPrefix}_${suffix}`;

  return {
    id: readText(term['wp:term_id']),
    taxonomy:
      fieldPrefix === 'term' ? readText(term['wp:term_taxonomy']) : taxonomy,
    slug: readText(
      term[fieldPrefix === 'category' ? 'wp:category_nicename' : key('slug')],
    ),
    parentSlug: readText(
      term[fieldPrefix === 'category' ? 'wp:category_parent' : key('parent')],
    ),
    name: readText(
      term[fieldPrefix === 'category' ? 'wp:cat_name' : key('name')],
    ),
    description: readText(term[key('description')]),
  };
};

const parseTaxonomyReference = (value: unknown): WordPressTaxonomyReference => {
  if (!isRecord(value)) {
    return {
      taxonomy: '',
      slug: '',
      name: readText(value),
    };
  }

  return {
    taxonomy: readText(value['@_domain']),
    slug: readText(value['@_nicename']),
    name: readText(value['#text']),
  };
};

const parseMeta = (value: unknown): Record<string, string[]> => {
  const meta: Record<string, string[]> = {};

  for (const rawMeta of asArray(value)) {
    if (!isRecord(rawMeta)) {
      continue;
    }

    const key = readText(rawMeta['wp:meta_key']);

    if (!key) {
      continue;
    }

    meta[key] = [...(meta[key] || []), readText(rawMeta['wp:meta_value'])];
  }

  return meta;
};

const parseItem = (value: unknown): WordPressItem => {
  const item = readRecord(value, 'channel.item');

  return {
    id: readText(item['wp:post_id']),
    title: readText(item.title),
    link: readText(item.link),
    creatorLogin: readText(item['dc:creator']),
    content: readText(item['content:encoded']),
    excerpt: readText(item['excerpt:encoded']),
    postDate: readText(item['wp:post_date']),
    postDateGmt: readText(item['wp:post_date_gmt']),
    modifiedDate: readText(item['wp:post_modified']),
    modifiedDateGmt: readText(item['wp:post_modified_gmt']),
    commentStatus: readText(item['wp:comment_status']),
    slug: readText(item['wp:post_name']),
    status: readText(item['wp:status']),
    parentId: readText(item['wp:post_parent']),
    menuOrder: readNumber(item['wp:menu_order']),
    postType: readText(item['wp:post_type']),
    postPassword: readText(item['wp:post_password']),
    isSticky: readText(item['wp:is_sticky']) === '1',
    attachmentUrl: readText(item['wp:attachment_url']),
    taxonomies: asArray(item.category)
      .map(parseTaxonomyReference)
      .filter(({ taxonomy, slug, name }) => taxonomy || slug || name),
    meta: parseMeta(item['wp:postmeta']),
    commentCount: asArray(item['wp:comment']).length,
  };
};

const validateWxrSource = (xml: string): void => {
  const rootIndex = xml.search(/<rss(?:\s|>)/i);
  const prolog = rootIndex === -1 ? xml : xml.slice(0, rootIndex);

  if (/<!DOCTYPE|<!ENTITY/i.test(prolog)) {
    throw new Error(
      'Unsafe WXR: document type and entity declarations are not allowed.',
    );
  }

  const validation = XMLValidator.validate(xml);

  if (validation !== true) {
    throw new Error(`Invalid WXR XML: ${validation.err.msg}`);
  }
};

export const parseWxrText = (xml: string): WordPressExport => {
  validateWxrSource(xml);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: false,
    parseTagValue: false,
    processEntities: false,
    trimValues: false,
  });
  const parsed: unknown = parser.parse(xml);
  const root = readRecord(parsed, 'rss');
  const rss = readRecord(root.rss, 'rss');
  const channel = readRecord(rss.channel, 'rss.channel');
  const wxrVersion = readText(channel['wp:wxr_version']);

  if (!wxrVersion) {
    throw new Error(
      'Invalid WXR: wp:wxr_version is missing. Export the site with WordPress Tools → Export.',
    );
  }

  const link = readText(channel.link);
  const baseBlogUrl = readText(channel['wp:base_blog_url']) || link;
  const baseSiteUrl = readText(channel['wp:base_site_url']) || baseBlogUrl;

  if (!baseBlogUrl && !baseSiteUrl) {
    throw new Error('Invalid WXR: the WordPress site URL is missing.');
  }

  const terms = [
    ...asArray(channel['wp:category']).map((value) =>
      parseTermRecord(value, 'category', 'category'),
    ),
    ...asArray(channel['wp:tag']).map((value) =>
      parseTermRecord(value, 'post_tag', 'tag'),
    ),
    ...asArray(channel['wp:term']).map((value) =>
      parseTermRecord(value, '', 'term'),
    ),
  ].filter(({ id, slug, name }) => id || slug || name);

  return {
    site: {
      title: readText(channel.title),
      description: readText(channel.description),
      link,
      language: readText(channel.language),
      baseSiteUrl,
      baseBlogUrl,
      wxrVersion,
    },
    authors: asArray(channel['wp:author']).map(parseAuthor),
    terms,
    items: asArray(channel.item).map(parseItem),
  };
};

export const parseWxrFile = async (
  wxrPath: string,
  maxBytes: number,
): Promise<WordPressExport> => {
  const fileStats = await stat(wxrPath);

  if (!fileStats.isFile()) {
    throw new Error(`WXR path is not a file: ${wxrPath}`);
  }

  if (fileStats.size > maxBytes) {
    throw new Error(
      `WXR file is ${fileStats.size} bytes, exceeding the ${maxBytes}-byte limit.`,
    );
  }

  return parseWxrText(await readFile(wxrPath, 'utf8'));
};
