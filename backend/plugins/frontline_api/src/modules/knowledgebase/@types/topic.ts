import { Document } from 'mongoose';
import { ICommonFields } from '@/knowledgebase/@types/common';

export interface ITopicStyles {
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

export interface ITopic {
  title?: string;
  code?: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
  color?: string;
  backgroundImage?: string;
  languageCode?: string;
  notificationSegmentId?: string;
  url?: string;
  kbToggle?: boolean;
  kbLabel?: string;
  kbTopicId?: string;
  ticketToggle?: boolean;
  ticketLabel?: string;
  ticketChannelId?: string;
  ticketPipelineId?: string;
  ticketStatusId?: string;
  styles?: ITopicStyles;
}

export interface ITopicDocument extends ICommonFields, ITopic, Document {
  _id: string;

  createdAt?: Date;
}
