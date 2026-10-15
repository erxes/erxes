import type {
  PortalArticle,
  PortalCategory,
  PortalSection,
  PortalTopic,
} from './normalize';

export const allCategories = (topic: PortalTopic): PortalCategory[] =>
  topic.sections.flatMap((section) => [section, ...section.children]);

export const allArticles = (topic: PortalTopic): PortalArticle[] =>
  allCategories(topic).flatMap((category) => category.articles);

export const findCategory = (
  topic: PortalTopic,
  categoryId: string,
): PortalCategory | null =>
  allCategories(topic).find((category) => category._id === categoryId) ?? null;

export const findSectionOf = (
  topic: PortalTopic,
  categoryId: string,
): PortalSection | null =>
  topic.sections.find(
    (section) =>
      section._id === categoryId ||
      section.children.some((child) => child._id === categoryId),
  ) ?? null;

export const findArticle = (
  topic: PortalTopic,
  articleId: string,
): PortalArticle | null =>
  allArticles(topic).find((article) => article._id === articleId) ?? null;

export type ArticleEntry = {
  article: PortalArticle;
  category: PortalCategory;
};

export const articleEntries = (topic: PortalTopic): ArticleEntry[] =>
  allCategories(topic).flatMap((category) =>
    category.articles.map((article) => ({ article, category })),
  );

export const sortByReadership = (entries: ArticleEntry[]): ArticleEntry[] =>
  [...entries].sort(
    (a, b) =>
      b.article.viewCount - a.article.viewCount ||
      (b.article.modifiedAt ?? '').localeCompare(a.article.modifiedAt ?? ''),
  );

export const sortByRecency = (articles: PortalArticle[]): PortalArticle[] =>
  [...articles].sort((a, b) =>
    (b.modifiedAt ?? '').localeCompare(a.modifiedAt ?? ''),
  );

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  nbsp: ' ',
};

const visibleText = (html: string): string =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|lt|gt|quot|nbsp);/g, (_, name: string) => ENTITIES[name]);

export const searchArticles = (
  topic: PortalTopic,
  term: string,
): PortalArticle[] => {
  const needle = term.trim().toLowerCase();

  if (!needle) {
    return [];
  }

  return allArticles(topic).filter((article) =>
    [article.title, article.summary, visibleText(article.content)]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
};

export type BrowseEntry = {
  category: PortalCategory;
  group: string | null;
};

export const browseCategories = (topic: PortalTopic): BrowseEntry[] =>
  topic.sections.flatMap((section): BrowseEntry[] => {
    if (section.children.length) {
      return section.children
        .filter((category) => category.articleCount)
        .map((category) => ({ category, group: section.title }));
    }

    return section.articleCount ? [{ category: section, group: null }] : [];
  });

export type BrowseGroup = {
  section: PortalSection | null;
  categories: PortalCategory[];
};

export const browseGroups = (topic: PortalTopic): BrowseGroup[] => {
  const ungrouped = topic.sections.filter(
    (section) => !section.children.length && section.articleCount,
  );
  const groups = topic.sections
    .filter((section) => section.children.length)
    .map((section) => ({
      section,
      categories: section.children.filter((category) => category.articleCount),
    }))
    .filter((group) => group.categories.length);

  return ungrouped.length
    ? [{ section: null, categories: ungrouped }, ...groups]
    : groups;
};

export const findGroupSection = (
  topic: PortalTopic,
  categoryId: string,
): PortalSection | null =>
  topic.sections.find(
    (section) => section._id === categoryId && section.children.length,
  ) ?? null;

export const sectionCards = (section: PortalSection): PortalCategory[] =>
  section.children.length
    ? section.children
    : section.articleCount
      ? [section]
      : [];

export const sectionArticleCount = (section: PortalSection): number =>
  section.children.length
    ? section.children.reduce((sum, child) => sum + child.articleCount, 0)
    : section.articleCount;

export { formatDate } from '@/modules/i18n/format';
