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

export const sortByRecency = (articles: PortalArticle[]): PortalArticle[] =>
  [...articles].sort((a, b) => (b.modifiedAt ?? '').localeCompare(a.modifiedAt ?? ''));

export const popularArticles = (
  topic: PortalTopic,
  limit: number,
): PortalArticle[] =>
  [...allArticles(topic)]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);

export const searchArticles = (
  topic: PortalTopic,
  term: string,
): PortalArticle[] => {
  const needle = term.trim().toLowerCase();

  if (!needle) {
    return [];
  }

  return allArticles(topic).filter((article) =>
    [article.title, article.summary, article.content]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
};

/**
 * Cards shown under a section: its child categories, or the section itself when
 * the topic is flat (no children but its own articles).
 */
export const sectionCards = (section: PortalSection): PortalCategory[] =>
  section.children.length ? section.children : section.articleCount ? [section] : [];

export const sectionArticleCount = (section: PortalSection): number =>
  section.children.length
    ? section.children.reduce((sum, child) => sum + child.articleCount, 0)
    : section.articleCount;

export const formatDate = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};
