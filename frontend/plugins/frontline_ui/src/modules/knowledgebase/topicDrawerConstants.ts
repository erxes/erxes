import {
  TopicFormData,
  TopicStyles,
  TTopicTab,
} from '@/knowledgebase/topicDrawerTypes';

export const FULL_WIDTH_SELECT = '[&_button]:w-full [&_button]:max-w-none';

export const FIELD_TAB: Record<keyof TopicFormData, TTopicTab> = {
  title: 'general',
  description: 'general',
  url: 'general',
  kbToggle: 'general',
  kbLabel: 'general',
  ticketToggle: 'general',
  ticketLabel: 'general',
  ticketChannelId: 'general',
  ticketPipelineId: 'general',
  ticketStatusId: 'general',
  notificationSegmentId: 'general',
  color: 'appearance',
  backgroundImage: 'appearance',
  styles: 'appearance',
};

export const EMPTY_TOPIC_STYLES: TopicStyles = {
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

export const EMPTY_TOPIC_FORM: TopicFormData = {
  title: '',
  description: '',
  color: '#000000',
  backgroundImage: '',
  notificationSegmentId: '',
  url: '',
  kbToggle: false,
  kbLabel: '',
  ticketToggle: false,
  ticketLabel: '',
  ticketChannelId: '',
  ticketPipelineId: '',
  ticketStatusId: '',
  styles: EMPTY_TOPIC_STYLES,
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
