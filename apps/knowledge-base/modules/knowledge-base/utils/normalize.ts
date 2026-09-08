import { storedFileUrl } from '@/modules/apollo/utils/file';
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

export type PortalTheme = {
  mainLogo: string | null;
  favicon: string | null;
  /** Sits behind the hero band, in place of its drawn pattern. */
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
  /** Whether the published site shows the knowledge base at all. */
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  /** Whether visitors may raise a ticket from the published site. */
  ticketsEnabled: boolean;
  ticketLabel: string;
  /** Empty ids mean the help center never chose a target; the env fills in. */
  ticketTarget: PortalTicketTarget;
  theme: PortalTheme;
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

const text = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

/*
 * The help center writes a colour only where one was picked, and the appearance
 * form stores an unset control as an empty string. Anything blank has to drop
 * out entirely so the portal's own token keeps its value instead of resolving
 * to an empty custom property.
 */
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
 * Maps the help center's appearance fields onto the portal's own theme tokens
 * from `globals.css`. One stored colour can drive several tokens — `bodyColor`
 * is both the page surface and what `erxes-ui` reads as `--color-background`.
 */
const normalizeTheme = (topic: KbTopic): PortalTheme => {
  const { styles } = topic;
  const colors: Record<string, string> = {};

  /*
   * The topic's own `color` is the accent picked on the appearance tab beside
   * the background image, and predates the `styles` block. It seeds the accent
   * so a topic that only set that much is still themed; anything in `styles`
   * is written after and wins.
   */
  paint(colors, ['--color-brand', '--color-primary'], text(topic.color));

  /*
   * Written most general first, so a more specific field set alongside it wins
   * the token they share: `helpCenterColor` is the accent everywhere, and
   * `primaryButtonColor` overrides it on buttons alone when both are set.
   */
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
  /* The footer is the only surface painted from its own colour. */
  paint(colors, ['--color-footer'], text(styles?.footerColor));
  /* Article and portal links; `linkHoverColor` doubles as the pressed accent. */
  paint(colors, ['--color-link'], text(styles?.linkColor));
  paint(
    colors,
    ['--color-link-hover', '--color-brand-strong'],
    text(styles?.linkHoverColor),
  );
  paint(colors, ['--color-primary'], text(styles?.primaryButtonColor));
  paint(colors, ['--color-muted'], text(styles?.secondaryButtonColor));

  /*
   * All three are uploads, so they come back as storage keys rather than URLs
   * and have to be resolved before anything renders them.
   */
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

export const normalizeTopic = (topic: KbTopic): PortalTopic => ({
  _id: topic._id,
  title: topic.title?.trim() ?? '',
  description: topic.description?.trim() ?? '',
  sections: (topic.parentCategories ?? []).map(normalizeSection),
  /*
   * Both toggles default to what the help center form defaults to, so a topic
   * saved before these fields existed keeps the portal's previous behaviour:
   * articles shown, tickets available.
   */
  knowledgeBaseEnabled: topic.kbToggle ?? true,
  knowledgeBaseLabel: text(topic.kbLabel) ?? '',
  ticketsEnabled: topic.ticketToggle ?? true,
  ticketLabel: text(topic.ticketLabel) ?? '',
  ticketTarget: {
    channelId: text(topic.ticketChannelId) ?? '',
    pipelineId: text(topic.ticketPipelineId) ?? '',
    statusId: text(topic.ticketStatusId) ?? '',
  },
  theme: normalizeTheme(topic),
});
