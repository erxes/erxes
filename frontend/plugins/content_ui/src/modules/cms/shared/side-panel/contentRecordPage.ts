import {
  CMS_CATEGORY_CONTENT_TYPE,
  CMS_CUSTOM_FIELD_CONTENT_TYPE,
  CMS_CUSTOM_TYPE_CONTENT_TYPE,
  CMS_FIELD_GROUP_CONTENT_TYPE,
  CMS_MENU_CONTENT_TYPE,
  CMS_PAGE_CONTENT_TYPE,
  CMS_POST_CONTENT_TYPE,
  CMS_TAG_CONTENT_TYPE,
  CMS_WEBSITE_CONTENT_TYPE,
  CONTENT_WEB_CONTENT_TYPE,
} from '@/cms/shared/side-panel/contentPanelTypes';

const CONTENT_TYPE_PREFIX = 'content:';
const CMS_PATH = '/content/cms';
const CMS_WEBSITE_PAGE = /^\/content\/cms\/([^/]+)/;

export const CONTENT_WEBSITE_RECORD_SECTIONS: Record<string, string> = {
  [CMS_TAG_CONTENT_TYPE]: 'tags',
  [CMS_CATEGORY_CONTENT_TYPE]: 'categories',
  [CMS_MENU_CONTENT_TYPE]: 'menus',
  [CMS_CUSTOM_TYPE_CONTENT_TYPE]: 'custom-types',
  [CMS_FIELD_GROUP_CONTENT_TYPE]: 'custom-fields',
  [CMS_CUSTOM_FIELD_CONTENT_TYPE]: 'custom-fields',
};

export const CONTENT_GLOBAL_RECORD_LISTS: Record<string, string> = {
  [CMS_WEBSITE_CONTENT_TYPE]: CMS_PATH,
  [CONTENT_WEB_CONTENT_TYPE]: '/content/web-builder',
};

const CONTENT_EDITOR_SECTIONS: Record<string, string> = {
  [CMS_POST_CONTENT_TYPE]: 'posts',
  [CMS_PAGE_CONTENT_TYPE]: 'pages',
};

export const toContentType = (recordType: string) =>
  `${CONTENT_TYPE_PREFIX}${recordType}`;

const toRecordType = (contentType: string) =>
  contentType.slice(CONTENT_TYPE_PREFIX.length);

const getRouteWebsiteId = (pathname: string) => {
  const websiteId = CMS_WEBSITE_PAGE.exec(pathname)?.[1];

  return websiteId && websiteId !== 'records' ? websiteId : '';
};

export const getContentRecordListPath = (
  contentType: string,
  websiteId?: string,
) => {
  const globalList = CONTENT_GLOBAL_RECORD_LISTS[contentType];

  if (globalList) {
    return globalList;
  }

  const section = CONTENT_WEBSITE_RECORD_SECTIONS[contentType];

  return websiteId && section
    ? `${CMS_PATH}/${websiteId}/${section}`
    : CMS_PATH;
};

export const getContentRecordDetailPath =
  (contentType: string) => (recordId: string, pathname: string) => {
    const recordType = toRecordType(contentType);

    if (CONTENT_GLOBAL_RECORD_LISTS[contentType]) {
      return `/content/records/${recordType}/${recordId}`;
    }

    const websiteId = getRouteWebsiteId(pathname);

    if (!websiteId) {
      return CMS_PATH;
    }

    const editorSection = CONTENT_EDITOR_SECTIONS[contentType];

    return editorSection
      ? `${CMS_PATH}/${websiteId}/${editorSection}/detail/${recordId}`
      : `${CMS_PATH}/${websiteId}/records/${recordType}/${recordId}`;
  };

export const hasContentRecordPage = (contentType: string) =>
  Boolean(
    CONTENT_WEBSITE_RECORD_SECTIONS[contentType] ||
      CONTENT_GLOBAL_RECORD_LISTS[contentType] ||
      CONTENT_EDITOR_SECTIONS[contentType],
  );
