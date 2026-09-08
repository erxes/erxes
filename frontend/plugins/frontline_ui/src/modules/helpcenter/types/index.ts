export interface IHelpCenterCategory {
  _id: string;
  title?: string;
  code?: string;
  description?: string;
  icon?: string;
  numOfArticles?: number;
}

export interface IHelpCenterStyles {
  mainLogo?: string;
  favicon?: string;
  bodyColor?: string;
  headerColor?: string;
  footerColor?: string;
  helpCenterColor?: string;
  backgroundColor?: string;
  activeTabColor?: string;
  baseFont?: string;
  baseColor?: string;
  headingFont?: string;
  headingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  dividerColor?: string;
  headerHtml?: string;
  footerHtml?: string;
}

export interface IHelpCenter {
  _id: string;
  title?: string;
  code?: string;
  description?: string;
  languageCode?: string;
  color?: string;
  backgroundImage?: string;
  notificationSegmentId?: string;
  brand?: { _id: string; name?: string } | null;
  categories?: IHelpCenterCategory[];
  createdDate?: string;

  url?: string;
  kbToggle?: boolean;
  kbLabel?: string;
  kbTopicId?: string;
  ticketToggle?: boolean;
  ticketLabel?: string;
  ticketChannelId?: string;
  ticketPipelineId?: string;
  ticketStatusId?: string;

  styles?: IHelpCenterStyles | null;
}

export interface IHelpCenterListResponse {
  knowledgeBaseTopics: IHelpCenter[];
  knowledgeBaseTopicsTotalCount: number;
}

export enum HelpCenterHotKeyScope {
  HelpCentersPage = 'help-centers-page',
}
