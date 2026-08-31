import type { IconName } from '@/modules/ui/components/Icon';
import { resolveIcon } from '../constants/icons';
import type { KbArticle, KbCategory, KbSection, KbTopic } from '../types';

export type PortalArticle = {
  _id: string;
  categoryId: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  modifiedAt: string | null;
  viewCount: number;
};

export type PortalCategory = {
  _id: string;
  title: string;
  description: string;
  icon: IconName;
  articleCount: number;
  authorCount: number;
  articles: PortalArticle[];
};

export type PortalSection = PortalCategory & {
  children: PortalCategory[];
};

export type PortalTopic = {
  _id: string;
  title: string;
  description: string;
  sections: PortalSection[];
};

const UNKNOWN_AUTHOR = 'Тодорхойгүй зохиогч';

const normalizeArticle = (
  article: KbArticle,
  categoryId: string,
): PortalArticle => ({
  _id: article._id,
  categoryId: article.categoryId ?? categoryId,
  title: article.title?.trim() || 'Гарчиггүй нийтлэл',
  summary: article.summary?.trim() ?? '',
  content: article.content ?? '',
  author: article.createdUser?.details?.fullName?.trim() || UNKNOWN_AUTHOR,
  modifiedAt:
    article.modifiedDate ?? article.publishedAt ?? article.createdDate,
  viewCount: article.viewCount ?? 0,
});

/*
 * A parent category exposes no `status` argument, so the gateway hands back
 * drafts beside published articles, and erxes treats `isPrivate` as internal.
 * Neither belongs on a public portal, so both go before anything renders.
 */
const isPublished = (article: KbArticle): boolean =>
  article.status === 'publish' && !article.isPrivate;

const normalizeCategory = (category: KbCategory): PortalCategory => {
  const articles = (category.articles ?? [])
    .filter(isPublished)
    .map((article) => normalizeArticle(article, category._id));

  return {
    _id: category._id,
    title: category.title?.trim() || 'Нэргүй ангилал',
    description: category.description?.trim() ?? '',
    icon: resolveIcon(category.icon),
    /*
     * Where the articles were asked for, the count is what the portal will
     * actually show; `numOfArticles` only stands in for the overview query,
     * which reads categories without their articles.
     */
    articleCount: category.articles
      ? articles.length
      : category.numOfArticles ?? 0,
    authorCount: new Set((category.authors ?? []).map((a) => a._id)).size,
    articles,
  };
};

const normalizeSection = (section: KbSection): PortalSection => ({
  ...normalizeCategory(section),
  children: (section.childrens ?? []).map(normalizeCategory),
});

export const normalizeTopic = (topic: KbTopic): PortalTopic => ({
  _id: topic._id,
  title: topic.title?.trim() ?? '',
  description: topic.description?.trim() ?? '',
  sections: (topic.parentCategories ?? []).map(normalizeSection),
});
