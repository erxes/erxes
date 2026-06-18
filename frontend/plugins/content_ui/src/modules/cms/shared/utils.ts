/**
 * Finds a translation entry for a specific language from a list of translations.
 * @param translations - The list of translation entries.
 * @param language - The language code to find.
 * @returns The matching translation entry or undefined.
 */
export const getTranslation = <T extends { language: string }>(
  translations: T[] | undefined,
  language: string | undefined,
): T | undefined => {
  if (!translations || !language || language.trim() === '') return undefined;
  return translations.find((t) => t.language === language);
};

export type PostUrlField = '_id' | 'count' | 'slug';

export interface PostUrlSource {
  _id?: string | null;
  count?: number | null;
  slug?: string | null;
}

export interface PostPublicUrlConfig {
  domain?: string | null;
  publicUrl?: string | null;
  postUrlField?: string | null;
  postUrlPrefix?: string | null;
}

interface BuildPostPublicUrlOptions {
  allowRelative?: boolean;
}

const trimTrailingSlashes = (value: string): string => {
  let endIndex = value.length;

  while (endIndex > 0 && value[endIndex - 1] === '/') {
    endIndex -= 1;
  }

  return value.slice(0, endIndex);
};

export const normalizePublicUrl = (value?: string | null) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return '';
  }

  const publicUrl = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  return trimTrailingSlashes(publicUrl);
};

export const normalizePostUrlField = (
  postUrlField?: string | null,
): PostUrlField => {
  if (postUrlField === 'count' || postUrlField === 'slug') {
    return postUrlField;
  }

  return '_id';
};

export const normalizePostUrlPrefix = (postUrlPrefix?: string | null) => {
  const trimmedValue = postUrlPrefix?.trim();

  if (!trimmedValue) {
    return '/posts';
  }

  const withLeadingSlash = trimmedValue.startsWith('/')
    ? trimmedValue
    : `/${trimmedValue}`;

  return trimTrailingSlashes(withLeadingSlash);
};

export const getPostUrlIdentifier = (
  post: PostUrlSource,
  postUrlField: PostUrlField,
) => {
  if (postUrlField === 'count') {
    return post.count === undefined || post.count === null
      ? ''
      : String(post.count);
  }

  const identifier = post[postUrlField];

  return identifier ? String(identifier) : '';
};

export const buildPostPublicUrl = (
  config: PostPublicUrlConfig | undefined,
  post: PostUrlSource,
  options: BuildPostPublicUrlOptions = {},
) => {
  const postUrlField = normalizePostUrlField(config?.postUrlField);
  const identifier = getPostUrlIdentifier(post, postUrlField);

  if (!identifier) {
    return '';
  }

  const baseUrl = normalizePublicUrl(config?.publicUrl || config?.domain);
  const postUrlPrefix = normalizePostUrlPrefix(config?.postUrlPrefix);
  const postPath = `${postUrlPrefix}/${encodeURIComponent(identifier)}`;

  if (!baseUrl) {
    return options.allowRelative ? postPath : '';
  }

  return `${baseUrl}${postPath}`;
};
