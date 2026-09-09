import {
  IHelpCenterConfigInput,
  IHelpCenterStyles,
  THelpCenterTab,
} from '@/helpcenter/types';

export const HELP_CENTERS_PER_PAGE = 100;

export const HELP_CENTER_TABLE_ID = 'frontline_help_center_record_table';

export const HELP_CENTER_FILTER_ID = 'help-centers-filter';

export const FULL_WIDTH_SELECT = '[&_button]:w-full [&_button]:max-w-none';

export const DEFAULT_HELP_CENTER_STYLES: IHelpCenterStyles = {
  mainLogo: '',
  favicon: '',

  bodyColor: '#ffffff',
  headerColor: '#ffffff',
  footerColor: '#ffffff',
  helpCenterColor: '#ffffff',
  backgroundColor: '#ffffff',
  activeTabColor: '#4f46e5',

  baseFont: '',
  baseColor: '#111827',
  headingFont: '',
  headingColor: '#111827',
  linkColor: '#4f46e5',
  linkHoverColor: '#4338ca',

  primaryButtonColor: '#4f46e5',
  secondaryButtonColor: '#e5e7eb',
  dividerColor: '#e5e7eb',

  headerHtml: '',
  footerHtml: '',
};

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
  color: '#000000',
  backgroundImage: '',
  styles: DEFAULT_HELP_CENTER_STYLES,
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
  color: 'appearance',
  backgroundImage: 'appearance',
  styles: 'appearance',
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
