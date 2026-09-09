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

  color?: string;
  backgroundImage?: string;
  styles?: IHelpCenterStyles | null;

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

  color: string;
  backgroundImage: string;
  styles: IHelpCenterStyles;
}

export type THelpCenterTab = 'general' | 'appearance';

export const HELP_CENTER_TABS: THelpCenterTab[] = ['general', 'appearance'];

export type TStyleName = `styles.${keyof IHelpCenterStyles}`;

export enum HelpCenterHotKeyScope {
  HelpCentersPage = 'help-centers-page',
}
