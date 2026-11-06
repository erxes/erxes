import { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'erxes-ui';
import { IRecordPanelProps, NEW_RECORD_ID } from 'ui-modules';
import { CONTENT_PANEL_FIELDS_CLASS_NAME } from '@/cms/shared/side-panel/ContentPanelForm';
import { ContentPanelActivity } from '@/cms/shared/side-panel/ContentPanelLayout';
import {
  CMS_CATEGORY_CONTENT_TYPE,
  CMS_CUSTOM_FIELD_CONTENT_TYPE,
  CMS_CUSTOM_TYPE_CONTENT_TYPE,
  CMS_FIELD_GROUP_CONTENT_TYPE,
  CMS_MENU_CONTENT_TYPE,
  CMS_PAGE_CONTENT_TYPE,
  CMS_TAG_CONTENT_TYPE,
  CMS_WEBSITE_CONTENT_TYPE,
  CONTENT_WEB_CONTENT_TYPE,
  IContentPanelHeading,
  IContentPanelViewProps,
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
import { WEBSITE_PANEL } from '@/cms/components/websites/WebsitePanel';
import { TAG_PANEL } from '@/cms/tags/TagPanel';
import { WEB_PANEL } from '@/web-builder/components/WebPanel';

export const RECORD_PANELS: Record<string, IContentPanelViews> = {
  [CMS_TAG_CONTENT_TYPE]: TAG_PANEL,
  [CMS_CATEGORY_CONTENT_TYPE]: CATEGORY_PANEL,
  [CMS_MENU_CONTENT_TYPE]: MENU_PANEL,
  [CMS_CUSTOM_TYPE_CONTENT_TYPE]: CUSTOM_TYPE_PANEL,
  [CMS_FIELD_GROUP_CONTENT_TYPE]: FIELD_GROUP_PANEL,
  [CMS_CUSTOM_FIELD_CONTENT_TYPE]: CUSTOM_FIELD_PANEL,
  [CMS_WEBSITE_CONTENT_TYPE]: WEBSITE_PANEL,
  [CONTENT_WEB_CONTENT_TYPE]: WEB_PANEL,
  [CMS_PAGE_CONTENT_TYPE]: PAGE_PANEL,
};

const ContentPanelScroll = ({ children }: { children: ReactNode }) => (
  <div
    className={cn(
      'mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col [&_.overflow-y-auto]:styled-scroll',
      CONTENT_PANEL_FIELDS_CLASS_NAME,
    )}
  >
    {children}
  </div>
);

const ContentPanelTitle = ({ label }: { label: string }) => {
  const { t } = useTranslation('content');

  return t(label);
};

type TUseHeading = (contentId: string) => IContentPanelHeading;

const ContentPanelRecordTitle = ({
  contentId,
  label,
  useHeading,
}: {
  contentId: string;
  label: string;
  useHeading: TUseHeading;
}) => {
  const { t } = useTranslation('content');
  const { name } = useHeading(contentId);

  return name || t(label);
};

const ContentPanelHeaderTitle = ({
  panel,
  contentId,
}: {
  panel: IContentPanelViews;
  contentId: string;
}) => {
  if (contentId === NEW_RECORD_ID) {
    return <ContentPanelTitle label={panel.addLabel} />;
  }

  return panel.useHeading ? (
    <ContentPanelRecordTitle
      contentId={contentId}
      label={panel.editLabel}
      useHeading={panel.useHeading}
    />
  ) : (
    <ContentPanelTitle label={panel.editLabel} />
  );
};

const getScrolledView = (
  panel: IContentPanelViews,
  view: IRecordPanelProps['view'],
): ComponentType<IContentPanelViewProps> | undefined => {
  if (view === 'new') return panel.New;
  if (view === 'detail') return panel.Detail;

  return undefined;
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

  if (view === 'title') {
    return <ContentPanelHeaderTitle panel={panel} contentId={contentId} />;
  }

  if (view === 'actions') {
    return panel.Actions ? (
      <panel.Actions contentType={contentType} contentId={contentId} />
    ) : null;
  }

  if (view === 'activity') {
    return <ContentPanelActivity contentId={contentId} />;
  }

  const View = getScrolledView(panel, view);

  return View ? (
    <ContentPanelScroll>
      <View contentType={contentType} contentId={contentId} />
    </ContentPanelScroll>
  ) : null;
};
