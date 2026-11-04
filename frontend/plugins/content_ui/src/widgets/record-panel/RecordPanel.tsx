import { useTranslation } from 'react-i18next';
import { IRecordPanelProps, NEW_RECORD_ID } from 'ui-modules';
import { ContentPanelActivity } from '@/cms/shared/side-panel/ContentPanelLayout';
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
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import { CATEGORY_PANEL } from '@/cms/categories/CategoryPanel';
import {
  CUSTOM_FIELD_PANEL,
  FIELD_GROUP_PANEL,
} from '@/cms/custom-fields/CustomFieldPanels';
import { CUSTOM_TYPE_PANEL } from '@/cms/custom-types/CustomTypePanel';
import { MENU_PANEL } from '@/cms/menus/MenuPanel';
import { PAGE_PANEL } from '@/cms/pages/PagePanel';
import { POST_PANEL } from '@/cms/posts/PostPanel';
import { WEBSITE_PANEL } from '@/cms/components/websites/WebsitePanel';
import { TAG_PANEL } from '@/cms/tags/TagPanel';
import { WEB_PANEL } from '@/web-builder/components/WebPanel';

const RECORD_PANELS: Record<string, IContentPanelViews> = {
  [CMS_TAG_CONTENT_TYPE]: TAG_PANEL,
  [CMS_CATEGORY_CONTENT_TYPE]: CATEGORY_PANEL,
  [CMS_MENU_CONTENT_TYPE]: MENU_PANEL,
  [CMS_CUSTOM_TYPE_CONTENT_TYPE]: CUSTOM_TYPE_PANEL,
  [CMS_FIELD_GROUP_CONTENT_TYPE]: FIELD_GROUP_PANEL,
  [CMS_CUSTOM_FIELD_CONTENT_TYPE]: CUSTOM_FIELD_PANEL,
  [CMS_WEBSITE_CONTENT_TYPE]: WEBSITE_PANEL,
  [CONTENT_WEB_CONTENT_TYPE]: WEB_PANEL,
  [CMS_POST_CONTENT_TYPE]: POST_PANEL,
  [CMS_PAGE_CONTENT_TYPE]: PAGE_PANEL,
};

const ContentPanelTitle = ({ label }: { label: string }) => {
  const { t } = useTranslation('content');

  return t(label);
};

export const RecordPanel = ({
  contentType,
  contentId,
  view,
}: IRecordPanelProps) => {
  const panel = RECORD_PANELS[contentType];

  if (!panel) {
    return null;
  }

  const { New, Actions, Detail } = panel;

  if (view === 'new') {
    return New ? <New contentType={contentType} contentId={contentId} /> : null;
  }

  if (view === 'title') {
    return (
      <ContentPanelTitle
        label={contentId === NEW_RECORD_ID ? panel.addLabel : panel.editLabel}
      />
    );
  }

  if (view === 'actions') {
    return Actions ? (
      <Actions contentType={contentType} contentId={contentId} />
    ) : null;
  }

  if (view === 'activity') {
    return <ContentPanelActivity contentId={contentId} />;
  }

  if (view === 'properties') {
    return null;
  }

  return <Detail contentType={contentType} contentId={contentId} />;
};
