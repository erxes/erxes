import type {
  CustomDomainFieldsFragment,
  HelpCenterConfigFieldsFragment,
} from '~/gql/graphql';

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

export type IHelpCenter = HelpCenterConfigFieldsFragment;

export interface IHelpCenterConfigInput {
  _id?: string;
  title: string;
  description: string;
  url: string;
  erxesAppToken: string;
  clientPortalId: string;
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
  cmsConfigs: IHelpCenterCmsConfig[];

  color: string;
  backgroundImage: string;
  styles: IHelpCenterStyles;
  header: IHelpCenterHeader;
  footer: IHelpCenterFooter;
}

export interface IHelpCenterCmsConfig {
  cmsId: string;
  cmsAppToken: string;
}

export type THelpCenterTab = 'general' | 'appearance' | 'embed' | 'domain';

export const HELP_CENTER_TABS: THelpCenterTab[] = [
  'general',
  'appearance',
  'embed',
  'domain',
];

export const HELP_CENTER_CREATE_TABS: THelpCenterTab[] = [
  'general',
  'appearance',
];

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

// The workspace's help center domain, served by every help center whose url
// matches it (or, failing that, the one on <subdomain>.helpcenter).
export type ICustomDomain = CustomDomainFieldsFragment;

export type ICustomDomainRecord = NonNullable<
  NonNullable<ICustomDomain['records']>[number]
>;
