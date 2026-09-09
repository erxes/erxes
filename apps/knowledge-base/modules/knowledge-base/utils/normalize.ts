import { storedFileUrl } from '@/modules/apollo/utils/file';
import type { PortalConfig } from '@/modules/config/types';
import type { IconName } from '@/modules/ui/components/Icon';
import { resolveIcon } from '../constants/icons';
import type {
  KbArticle,
  KbCategory,
  KbSection,
  KbTopic,
  KbTopicStyles,
} from '../types';

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

export type PortalTheme = {
  mainLogo: string | null;
  favicon: string | null;
  heroImage: string | null;
  colors: Record<string, string>;
  baseFont: string | null;
  headingFont: string | null;
  headerHtml: string | null;
  footerHtml: string | null;
};

export type PortalTicketTarget = {
  channelId: string;
  pipelineId: string;
  statusId: string;
};

export type PortalTopic = {
  _id: string;
  title: string;
  description: string;
  sections: PortalSection[];
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  ticketsEnabled: boolean;
  ticketLabel: string;
  ticketTarget: PortalTicketTarget;
  theme: PortalTheme;
};

const UNKNOWN_AUTHOR = 'Unknown author';

const normalizeArticle = (
  article: KbArticle,
  categoryId: string,
): PortalArticle => ({
  _id: article._id,
  categoryId: article.categoryId ?? categoryId,
  title: article.title?.trim() || 'Untitled article',
  summary: article.summary?.trim() ?? '',
  content: article.content ?? '',
  author: article.createdUser?.details?.fullName?.trim() || UNKNOWN_AUTHOR,
  modifiedAt:
    article.modifiedDate ?? article.publishedAt ?? article.createdDate,
  viewCount: article.viewCount ?? 0,
});

const isPublished = (article: KbArticle): boolean =>
  article.status === 'publish' && !article.isPrivate;

const normalizeCategory = (category: KbCategory): PortalCategory => {
  const articles = (category.articles ?? [])
    .filter(isPublished)
    .map((article) => normalizeArticle(article, category._id));

  return {
    _id: category._id,
    title: category.title?.trim() || 'Untitled category',
    description: category.description?.trim() ?? '',
    icon: resolveIcon(category.icon),
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

const text = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

const paint = (
  colors: Record<string, string>,
  tokens: string[],
  value: string | null,
) => {
  if (!value) {
    return;
  }

  for (const token of tokens) {
    colors[token] = value;
  }
};

/*
 * Reads only the appearance fields, so the help center config — which carries
 * the same three — is themed by this one function rather than a copy of it.
 */
export const normalizeTheme = (topic: {
  color: string | null;
  backgroundImage: string | null;
  styles: KbTopicStyles;
}): PortalTheme => {
  const { styles } = topic;
  const colors: Record<string, string> = {};

  paint(colors, ['--color-brand', '--color-primary'], text(topic.color));

  paint(
    colors,
    ['--color-brand', '--color-primary'],
    text(styles?.helpCenterColor),
  );
  paint(
    colors,
    ['--color-hero', '--color-hero-soft'],
    text(styles?.headerColor),
  );
  paint(
    colors,
    ['--color-subtle', '--color-accent'],
    text(styles?.backgroundColor),
  );
  paint(colors, ['--color-background'], text(styles?.bodyColor));
  paint(colors, ['--color-brand-strong'], text(styles?.activeTabColor));
  paint(
    colors,
    ['--color-ink-soft', '--color-foreground'],
    text(styles?.baseColor),
  );
  paint(colors, ['--color-ink'], text(styles?.headingColor));
  paint(colors, ['--color-line', '--color-border'], text(styles?.dividerColor));
  paint(colors, ['--color-footer'], text(styles?.footerColor));
  paint(colors, ['--color-link'], text(styles?.linkColor));
  paint(
    colors,
    ['--color-link-hover', '--color-brand-strong'],
    text(styles?.linkHoverColor),
  );
  paint(colors, ['--color-primary'], text(styles?.primaryButtonColor));
  paint(colors, ['--color-muted'], text(styles?.secondaryButtonColor));

  return {
    mainLogo: storedFileUrl(text(styles?.mainLogo)),
    favicon: storedFileUrl(text(styles?.favicon)),
    heroImage: storedFileUrl(text(topic.backgroundImage)),
    colors,
    baseFont: text(styles?.baseFont),
    headingFont: text(styles?.headingFont),
    headerHtml: text(styles?.headerHtml),
    footerHtml: text(styles?.footerHtml),
  };
};

/*
 * The topic supplies the article tree; everything else on a portal — its name,
 * which features are on, where a ticket lands, how it is painted — belongs to
 * the help center config that points at it.
 */
export const normalizeTopic = (
  topic: KbTopic,
  config: PortalConfig,
): PortalTopic => ({
  _id: topic._id,
  title: config.title || topic.title?.trim() || '',
  description: config.description || topic.description?.trim() || '',
  sections: (topic.parentCategories ?? []).map(normalizeSection),
  knowledgeBaseEnabled: config.knowledgeBaseEnabled,
  knowledgeBaseLabel: config.knowledgeBaseLabel,
  ticketsEnabled: config.ticketsEnabled,
  ticketLabel: config.ticketLabel,
  ticketTarget: {
    channelId: config.ticketChannelId,
    pipelineId: config.ticketPipelineId,
    statusId: config.ticketStatusId,
  },
  theme: normalizeTheme(config),
});

/** Stands in where the config publishes no knowledge base at all. */
export const emptyTopic = (config: PortalConfig): PortalTopic => ({
  _id: config._id,
  title: config.title,
  description: config.description,
  sections: [],
  knowledgeBaseEnabled: false,
  knowledgeBaseLabel: config.knowledgeBaseLabel,
  ticketsEnabled: config.ticketsEnabled,
  ticketLabel: config.ticketLabel,
  ticketTarget: {
    channelId: config.ticketChannelId,
    pipelineId: config.ticketPipelineId,
    statusId: config.ticketStatusId,
  },
  theme: normalizeTheme(config),
});
