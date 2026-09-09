import { Document } from 'mongoose';

export interface IHelpCenterConfigStyles {
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

export interface IHelpCenterConfig {
  title?: string;
  description?: string;
  url?: string;
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
  styles?: IHelpCenterConfigStyles;

  createdBy?: string;
  modifiedBy?: string;
}

export interface IHelpCenterConfigInput extends IHelpCenterConfig {
  _id?: string;
}

export interface IHelpCenterConfigDocument extends IHelpCenterConfig, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
