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
  kbTopicId: 'general',
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

/*
 * A new help center opens on the published site's own palette rather than on
 * blank white, so it looks finished before anyone touches the appearance tab.
 * These are the portal's default tokens; changing one here changes what every
 * help center created afterwards starts from, not what existing ones show.
 */
export const EMPTY_TOPIC_STYLES: TopicStyles = {
  mainLogo: '',
  favicon: '',

  bodyColor: '#ffffff',
  headerColor: '#403474',
  footerColor: '#ffffff',
  helpCenterColor: '#4f33af',
  backgroundColor: '#f7f6fb',
  activeTabColor: '#3f2790',

  baseFont: '',
  baseColor: '#3d3b55',
  headingFont: '',
  headingColor: '#17162a',
  linkColor: '#4f33af',
  linkHoverColor: '#3f2790',

  primaryButtonColor: '#4f33af',
  secondaryButtonColor: '#e9e7f1',
  dividerColor: '#e9e7f1',

  headerHtml: '',
  footerHtml: '',
};

export const EMPTY_TOPIC_FORM: TopicFormData = {
  title: '',
  description: '',
  /* The topic's own accent; starts on the palette above, not on black. */
  color: '#4f33af',
  backgroundImage: '',
  notificationSegmentId: '',
  url: '',
  kbToggle: true,
  kbLabel: '',
  kbTopicId: '',
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
