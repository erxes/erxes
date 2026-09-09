export interface TopicStyles {
  mainLogo: string;
  favicon: string;

  bodyColor: string;
  headerColor: string;
  footerColor: string;
  helpCenterColor: string;
  backgroundColor: string;
  activeTabColor: string;

  baseFont: string;
  baseColor: string;
  headingFont: string;
  headingColor: string;
  linkColor: string;
  linkHoverColor: string;

  primaryButtonColor: string;
  secondaryButtonColor: string;
  dividerColor: string;

  headerHtml: string;
  footerHtml: string;
}

export interface Topic {
  _id: string;
  title: string;
  description: string;
  code: string;
  brandId: string;
  color: string;
  backgroundImage: string;
  languageCode: string;
  notificationSegmentId: string;
  url?: string;
  kbToggle?: boolean;
  kbLabel?: string;
  kbTopicId?: string;
  ticketToggle?: boolean;
  ticketLabel?: string;
  ticketChannelId?: string;
  ticketPipelineId?: string;
  ticketStatusId?: string;
  styles?: Partial<TopicStyles> | null;
}

export interface TopicFormData {
  title: string;
  description: string;
  color: string;
  backgroundImage: string;
  notificationSegmentId: string;
  url: string;
  kbToggle: boolean;
  kbLabel: string;
  kbTopicId: string;
  ticketToggle: boolean;
  ticketLabel: string;
  ticketChannelId: string;
  ticketPipelineId: string;
  ticketStatusId: string;
  styles: TopicStyles;
}
export type TStyleName = `styles.${keyof TopicStyles}`;

export const TOPIC_TABS = ['general', 'appearance'] as const;

export type TTopicTab = (typeof TOPIC_TABS)[number];
