import { format } from 'date-fns';
import {
  TKbArticle,
  TKbCategory,
  TKbHostMessage,
} from '../types/knowledgeBaseTypes';

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

export const formatArticleDate = (article: TKbArticle) => {
  const value = article.modifiedDate || article.publishedAt;

  if (!value) {
    return '';
  }

  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return '';
  }
};

export const articleCountLabel = (count: number) =>
  count === 1 ? '1 article' : `${count} articles`;
