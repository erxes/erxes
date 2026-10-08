export type TKbArticle = {
  _id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  modifiedDate?: string | null;
  publishedAt?: string | null;
};

export type TKbCategory = {
  _id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  parentCategoryId?: string | null;
  articles?: TKbArticle[] | null;
};

export type TKbTopic = {
  _id: string;
  title?: string | null;
  description?: string | null;
  color?: string | null;
  categories?: TKbCategory[] | null;
};

export type TKbHostMessage =
  | { type: 'ready'; color?: string | null }
  | { type: 'close' };

export const childCategories = (
  categories: TKbCategory[],
  parentId: string,
): TKbCategory[] =>
  categories.filter((category) => category.parentCategoryId === parentId);

export const rootCategories = (categories: TKbCategory[]): TKbCategory[] =>
  categories.filter(
    (category) =>
      !category.parentCategoryId ||
      !categories.some((parent) => parent._id === category.parentCategoryId),
  );

export const articleCount = (
  categories: TKbCategory[],
  category: TKbCategory,
  visited: Set<string> = new Set(),
): number => {
  if (visited.has(category._id)) {
    return 0;
  }

  visited.add(category._id);

  return childCategories(categories, category._id).reduce(
    (total, child) => total + articleCount(categories, child, visited),
    category.articles?.length ?? 0,
  );
};

const plainText = (html?: string | null) =>
  (html ?? '').replace(/<[^>]*>/g, ' ');

export const searchArticles = (
  categories: TKbCategory[],
  term: string,
): TKbArticle[] => {
  const needle = term.trim().toLowerCase();

  if (!needle) {
    return [];
  }

  return categories
    .flatMap((category) => category.articles ?? [])
    .filter((article) =>
      [article.title, article.summary, plainText(article.content)]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
};

export const findArticle = (
  categories: TKbCategory[],
  articleId: string,
): TKbArticle | undefined =>
  categories
    .flatMap((category) => category.articles ?? [])
    .find((article) => article._id === articleId);

export const postToHost = (message: TKbHostMessage) =>
  window.parent.postMessage({ fromErxesKnowledgeBase: true, ...message }, '*');
