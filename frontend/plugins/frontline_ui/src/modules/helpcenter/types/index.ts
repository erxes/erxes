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

export interface IHelpCenterHeader {
  wordmark: string;
  homeLabel: string;
  formsLabel: string;
  announcementsLabel: string;
  searchPlaceholder: string;
}

export interface IHelpCenterFooterLink {
  label: string;
  url: string;
}

export interface IHelpCenterFooterColumn {
  heading: string;
  links: IHelpCenterFooterLink[];
}

export interface IHelpCenterFooter {
  logo: string;
  description: string;
  copyright: string;
  columns: IHelpCenterFooterColumn[];
}

export interface IHelpCenter {
  _id: string;
  title?: string;
  description?: string;
  url?: string;
  erxesAppToken?: string;
  brandId?: string;
  languageCode?: string;

  kbToggle?: boolean;
  kbLabel?: string;
  kbTopicId?: string;

  ticketToggle?: boolean;
  ticketLabel?: string;
  ticketChannelId?: string;
  ticketPipelineId?: string;
  ticketStatusId?: string;

  formChannelId?: string;
  formIds?: string[];

  cmsId?: string;
  cmsAppToken?: string;

  color?: string;
  backgroundImage?: string;
  styles?: IHelpCenterStyles | null;
  header?: IHelpCenterHeader | null;
  footer?: IHelpCenterFooter | null;

  brand?: { _id: string; name?: string } | null;
  createdAt?: string;
}

export interface IHelpCenterListResponse {
  helpCenterConfigs: IHelpCenter[];
  helpCenterConfigsTotalCount: number;
}

export interface IHelpCenterDetailResponse {
  helpCenterConfig: IHelpCenter | null;
}

export interface IHelpCenterConfigInput {
  _id?: string;
  title: string;
  description: string;
  url: string;
  erxesAppToken: string;
  brandId: string;
  languageCode: string;

  kbToggle: boolean;
  kbLabel: string;
  kbTopicId: string;

  ticketToggle: boolean;
  ticketLabel: string;
  ticketChannelId: string;
  ticketPipelineId: string;
  ticketStatusId: string;

  formChannelId: string;
  formIds: string[];

  cmsId: string;
  cmsAppToken: string;

  color: string;
  backgroundImage: string;
  styles: IHelpCenterStyles;
  header: IHelpCenterHeader;
  footer: IHelpCenterFooter;
}

export type THelpCenterTab = 'general' | 'appearance';

export const HELP_CENTER_TABS: THelpCenterTab[] = ['general', 'appearance'];

export type TStyleName = `styles.${keyof IHelpCenterStyles}`;

export type THeaderName = `header.${keyof IHelpCenterHeader}`;

export type TFooterColumnName = `footer.columns.${number}`;

export type TFooterLinkName = `${TFooterColumnName}.links.${number}`;

export type HelpCenterColorField = {
  name: TStyleName;
  key: string;
  label: string;
};

export type HelpCenterHeaderField = {
  name: THeaderName;
  key: string;
  label: string;
  placeholder: string;
};

export enum HelpCenterHotKeyScope {
  HelpCentersPage = 'help-centers-page',
}
