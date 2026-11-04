import { ComponentType } from 'react';

export const CMS_TAG_CONTENT_TYPE = 'content:cmsTag';
export const CMS_CATEGORY_CONTENT_TYPE = 'content:cmsCategory';
export const CMS_MENU_CONTENT_TYPE = 'content:cmsMenu';
export const CMS_CUSTOM_TYPE_CONTENT_TYPE = 'content:cmsCustomType';
export const CMS_FIELD_GROUP_CONTENT_TYPE = 'content:cmsFieldGroup';
export const CMS_CUSTOM_FIELD_CONTENT_TYPE = 'content:cmsCustomField';
export const CMS_WEBSITE_CONTENT_TYPE = 'content:cmsWebsite';
export const CONTENT_WEB_CONTENT_TYPE = 'content:web';
export const CMS_POST_CONTENT_TYPE = 'content:cmsPost';
export const CMS_PAGE_CONTENT_TYPE = 'content:cmsPage';

export const CONTENT_PANEL_CONTENT_TYPES = [
  CMS_TAG_CONTENT_TYPE,
  CMS_CATEGORY_CONTENT_TYPE,
  CMS_MENU_CONTENT_TYPE,
  CMS_CUSTOM_TYPE_CONTENT_TYPE,
  CMS_FIELD_GROUP_CONTENT_TYPE,
  CMS_CUSTOM_FIELD_CONTENT_TYPE,
  CMS_WEBSITE_CONTENT_TYPE,
  CONTENT_WEB_CONTENT_TYPE,
  CMS_POST_CONTENT_TYPE,
  CMS_PAGE_CONTENT_TYPE,
];

export interface IContentPanelDraftDefaults extends Record<string, unknown> {
  clientPortalId?: string;
  groupId?: string;
}

export interface IContentPanelViewProps {
  contentType: string;
  contentId: string;
}

export interface IContentPanelViews {
  addLabel: string;
  editLabel: string;
  New?: ComponentType<IContentPanelViewProps>;
  Detail: ComponentType<IContentPanelViewProps>;
  Actions?: ComponentType<IContentPanelViewProps>;
}
