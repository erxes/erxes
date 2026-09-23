import {
  HelpCenterColorField,
  HelpCenterHeaderField,
  IHelpCenterConfigInput,
  IHelpCenterFooter,
  IHelpCenterFooterColumn,
  IHelpCenterHeader,
  IHelpCenterStyles,
  THelpCenterTab,
} from '@/helpcenter/types';

export const HELP_CENTERS_PER_PAGE = 100;

export const HELP_CENTER_TABLE_ID = 'frontline_help_center_record_table';

export const HELP_CENTER_FILTER_ID = 'help-centers-filter';

export const FULL_WIDTH_SELECT =
  '[&_button]:w-full [&_button]:max-w-none [&_button]:h-8';

export const HELP_CENTER_MAIN_COLOR_FIELDS = [
  { name: 'styles.bodyColor', key: 'kb-body-color', label: 'Body' },
  { name: 'styles.headerColor', key: 'kb-header-color', label: 'Header' },
  { name: 'styles.footerColor', key: 'kb-footer-color', label: 'Footer' },
  {
    name: 'styles.helpCenterColor',
    key: 'kb-help-center-color',
    label: 'Help center',
  },
  {
    name: 'styles.backgroundColor',
    key: 'kb-background-color',
    label: 'Background',
  },
  {
    name: 'styles.activeTabColor',
    key: 'kb-active-tab-color',
    label: 'Active tab',
  },
] as const satisfies readonly HelpCenterColorField[];

export const HELP_CENTER_TEXT_COLOR_FIELDS = [
  { name: 'styles.baseColor', key: 'kb-base-color', label: 'Base color' },
  {
    name: 'styles.headingColor',
    key: 'kb-heading-color',
    label: 'Heading color',
  },
  { name: 'styles.linkColor', key: 'kb-link-color', label: 'Link text' },
  {
    name: 'styles.linkHoverColor',
    key: 'kb-link-hover-color',
    label: 'Link hover text',
  },
] as const satisfies readonly HelpCenterColorField[];

export const HELP_CENTER_FORM_COLOR_FIELDS = [
  {
    name: 'styles.primaryButtonColor',
    key: 'kb-primary-button-color',
    label: 'Primary action button',
  },
  {
    name: 'styles.secondaryButtonColor',
    key: 'kb-secondary-button-color',
    label: 'Secondary action button',
  },
  {
    name: 'styles.dividerColor',
    key: 'kb-divider-color',
    label: 'Heading divider & input focus glow',
  },
] as const satisfies readonly HelpCenterColorField[];

export const DEFAULT_HELP_CENTER_STYLES: IHelpCenterStyles = {
  mainLogo: '',
  favicon: '',

  bodyColor: '#ffffff',
  headerColor: '#3b2f6e',
  footerColor: '#ffffff',
  helpCenterColor: '#4f33af',
  backgroundColor: '#f8f8fb',
  activeTabColor: '#3f2790',

  baseFont: '',
  baseColor: '#45435f',
  headingFont: '',
  headingColor: '#14142b',
  linkColor: '#4f33af',
  linkHoverColor: '#3f2790',

  primaryButtonColor: '#4f33af',
  secondaryButtonColor: '#e7e6f0',
  dividerColor: '#e7e6f0',

  headerHtml: '',
  footerHtml: '',
};

export const DEFAULT_HELP_CENTER_HEADER: IHelpCenterHeader = {
  wordmark: '',
  homeLabel: '',
  formsLabel: '',
  announcementsLabel: '',
  searchPlaceholder: '',
};

export const createDefaultHeader = (): IHelpCenterHeader => ({
  ...DEFAULT_HELP_CENTER_HEADER,
});

export const HELP_CENTER_HEADER_FIELDS = [
  {
    name: 'header.wordmark',
    key: 'kb-header-wordmark',
    label: 'Wordmark',
    placeholder: 'erxes',
  },
  {
    name: 'header.homeLabel',
    key: 'kb-header-home-label',
    label: 'Home tab',
    placeholder: 'Support portal',
  },
  {
    name: 'header.formsLabel',
    key: 'kb-header-forms-label',
    label: 'Forms tab',
    placeholder: 'Forms',
  },
  {
    name: 'header.announcementsLabel',
    key: 'kb-header-announcements-label',
    label: 'Announcements tab',
    placeholder: 'Announcements',
  },
  {
    name: 'header.searchPlaceholder',
    key: 'kb-header-search-placeholder',
    label: 'Search placeholder',
    placeholder: 'Search for articles...',
  },
] as const satisfies readonly HelpCenterHeaderField[];

export const DEFAULT_HELP_CENTER_FOOTER_COLUMNS: IHelpCenterFooterColumn[] = [
  {
    heading: 'Support',
    links: [
      { label: 'Submit a ticket', url: '/tickets/new' },
      { label: 'Track a ticket', url: '/tickets/track' },
      { label: 'My tickets', url: '/tickets' },
      { label: 'Fill in a form', url: '/forms' },
    ],
  },
  {
    heading: 'Knowledge base',
    links: [
      { label: 'All categories', url: '/knowledge-base' },
      { label: 'Search', url: '/search' },
      { label: 'Announcements', url: '/announcements' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'My account', url: '/account' },
      { label: 'Sign in', url: '/sign-in' },
      { label: 'Sign up', url: '/sign-up' },
    ],
  },
];

export const DEFAULT_HELP_CENTER_FOOTER: IHelpCenterFooter = {
  logo: '',
  description: '',
  copyright: '',
  columns: [],
};

export const createEmptyFooterColumn = (): IHelpCenterFooterColumn => ({
  heading: '',
  links: [{ label: '', url: '' }],
});

export const createDefaultFooter = (): IHelpCenterFooter => ({
  ...DEFAULT_HELP_CENTER_FOOTER,
  columns: [],
});

export const EMPTY_HELP_CENTER_FORM: IHelpCenterConfigInput = {
  title: '',
  description: '',
  url: '',
  erxesAppToken: '',
  brandId: '',
  languageCode: '',
  kbToggle: true,
  kbLabel: '',
  kbTopicId: '',
  ticketToggle: false,
  ticketLabel: '',
  ticketChannelId: '',
  ticketPipelineId: '',
  ticketStatusId: '',
  formChannelId: '',
  formIds: [],
  cmsId: '',
  cmsAppToken: '',
  color: '#4f33af',
  backgroundImage: '',
  styles: DEFAULT_HELP_CENTER_STYLES,
  header: DEFAULT_HELP_CENTER_HEADER,
  footer: DEFAULT_HELP_CENTER_FOOTER,
};

export const HELP_CENTER_FIELD_TAB: Record<
  keyof IHelpCenterConfigInput,
  THelpCenterTab
> = {
  _id: 'general',
  title: 'general',
  description: 'general',
  url: 'general',
  erxesAppToken: 'general',
  brandId: 'general',
  languageCode: 'general',
  kbToggle: 'general',
  kbLabel: 'general',
  kbTopicId: 'general',
  ticketToggle: 'general',
  ticketLabel: 'general',
  ticketChannelId: 'general',
  ticketPipelineId: 'general',
  ticketStatusId: 'general',
  formChannelId: 'general',
  formIds: 'general',
  cmsId: 'general',
  cmsAppToken: 'general',
  color: 'appearance',
  backgroundImage: 'appearance',
  styles: 'appearance',
  header: 'appearance',
  footer: 'appearance',
};

export const HELP_CENTER_FONTS = [
  { label: 'Ubuntu', value: 'Ubuntu, sans-serif' },
  { label: 'Lobster', value: 'Lobster, cursive' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Roboto Condensed', value: "'Roboto Condensed', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Merriweather', value: 'Merriweather, serif' },
] as const;
