export type KbUser = {
  _id: string;
  details?: {
    fullName?: string | null;
    avatar?: string | null;
  } | null;
} | null;

export type KbArticle = {
  _id: string;
  title: string | null;
  summary: string | null;
  content: string | null;
  status: string | null;
  isPrivate: boolean | null;
  categoryId: string | null;
  viewCount: number | null;
  createdDate: string | null;
  modifiedDate: string | null;
  publishedAt: string | null;
  createdUser: KbUser;
};

export type KbCategory = {
  _id: string;
  title: string | null;
  description: string | null;
  icon: string | null;
  numOfArticles: number | null;
  authors: { _id: string }[] | null;
  articles?: KbArticle[] | null;
};

export type KbSection = KbCategory & {
  childrens: KbCategory[] | null;
};

export type KbTopicStyles = {
  mainLogo: string | null;
  favicon: string | null;

  bodyColor: string | null;
  headerColor: string | null;
  footerColor: string | null;
  helpCenterColor: string | null;
  backgroundColor: string | null;
  activeTabColor: string | null;

  baseFont: string | null;
  baseColor: string | null;
  headingFont: string | null;
  headingColor: string | null;
  linkColor: string | null;
  linkHoverColor: string | null;

  primaryButtonColor: string | null;
  secondaryButtonColor: string | null;
  dividerColor: string | null;

  headerHtml: string | null;
  footerHtml: string | null;
} | null;

export type KbTopic = {
  _id: string;
  title: string | null;
  description: string | null;
  color: string | null;
  url: string | null;
  kbToggle: boolean | null;
  kbLabel: string | null;
  kbTopicId: string | null;
  ticketToggle: boolean | null;
  ticketLabel: string | null;
  ticketChannelId: string | null;
  ticketPipelineId: string | null;
  ticketStatusId: string | null;
  styles: KbTopicStyles;
  parentCategories: KbSection[] | null;
};
