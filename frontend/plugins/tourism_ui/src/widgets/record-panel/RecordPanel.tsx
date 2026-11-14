import { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'erxes-ui';
import { IRecordPanelProps, NEW_RECORD_ID } from 'ui-modules';
import { TOURISM_PANEL_FIELDS_CLASS_NAME } from '@/tms/side-panel/TourismPanelForm';
import { TourismPanelActivity } from '@/tms/side-panel/TourismPanelLayout';
import {
  ITourismPanelHeading,
  ITourismPanelViewProps,
  ITourismPanelViews,
  TMS_AMENITY_CONTENT_TYPE,
  TMS_CATEGORY_CONTENT_TYPE,
  TMS_CUSTOM_FIELD_CONTENT_TYPE,
  TMS_ELEMENT_CONTENT_TYPE,
  TMS_FIELD_GROUP_CONTENT_TYPE,
  TMS_ITINERARY_CONTENT_TYPE,
  TMS_ITINERARY_DUPLICATE_CONTENT_TYPE,
  TMS_ORDER_CONTENT_TYPE,
  TMS_TOUR_CONTENT_TYPE,
  TMS_TOUR_TYPE_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import { AMENITY_PANEL } from '@/tms/branch-detail/dashboard/amenities/_components/AmenityPanel';
import { CATEGORY_PANEL } from '@/tms/branch-detail/dashboard/category/_components/CategoryPanel';
import {
  CUSTOM_FIELD_PANEL,
  FIELD_GROUP_PANEL,
  TOUR_TYPE_PANEL,
} from '@/tms/branch-detail/dashboard/custom-fields/CustomFieldPanels';
import { ELEMENT_PANEL } from '@/tms/branch-detail/dashboard/elements/_components/ElementPanel';
import { ITINERARY_DUPLICATE_PANEL } from '@/tms/branch-detail/dashboard/itinerary/_components/ItineraryDuplicatePanel';
import { ITINERARY_PANEL } from '@/tms/branch-detail/dashboard/itinerary/_components/ItineraryPanel';
import { ORDER_PANEL } from '@/tms/branch-detail/dashboard/tours/_components/OrderPanel';
import { TOUR_PANEL } from '@/tms/branch-detail/dashboard/tours/_components/TourPanel';

export const RECORD_PANELS: Record<string, ITourismPanelViews> = {
  [TMS_TOUR_CONTENT_TYPE]: TOUR_PANEL,
  [TMS_ORDER_CONTENT_TYPE]: ORDER_PANEL,
  [TMS_ITINERARY_CONTENT_TYPE]: ITINERARY_PANEL,
  [TMS_ITINERARY_DUPLICATE_CONTENT_TYPE]: ITINERARY_DUPLICATE_PANEL,
  [TMS_ELEMENT_CONTENT_TYPE]: ELEMENT_PANEL,
  [TMS_AMENITY_CONTENT_TYPE]: AMENITY_PANEL,
  [TMS_CATEGORY_CONTENT_TYPE]: CATEGORY_PANEL,
  [TMS_TOUR_TYPE_CONTENT_TYPE]: TOUR_TYPE_PANEL,
  [TMS_FIELD_GROUP_CONTENT_TYPE]: FIELD_GROUP_PANEL,
  [TMS_CUSTOM_FIELD_CONTENT_TYPE]: CUSTOM_FIELD_PANEL,
};

const TourismPanelScroll = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col [&_.overflow-y-auto]:styled-scroll',
      className,
    )}
  >
    {children}
  </div>
);

const TourismPanelTitle = ({ label }: { label: string }) => {
  const { t } = useTranslation('tourism');

  return t(label);
};

type TUseHeading = (contentId: string) => ITourismPanelHeading;

const TourismPanelRecordTitle = ({
  contentId,
  label,
  useHeading,
}: {
  contentId: string;
  label: string;
  useHeading: TUseHeading;
}) => {
  const { t } = useTranslation('tourism');
  const { name } = useHeading(contentId);

  return name || t(label);
};

const TourismPanelHeaderTitle = ({
  panel,
  contentId,
}: {
  panel: ITourismPanelViews;
  contentId: string;
}) => {
  if (contentId === NEW_RECORD_ID) {
    return <TourismPanelTitle label={panel.addLabel} />;
  }

  return panel.useHeading ? (
    <TourismPanelRecordTitle
      contentId={contentId}
      label={panel.editLabel}
      useHeading={panel.useHeading}
    />
  ) : (
    <TourismPanelTitle label={panel.editLabel} />
  );
};

const getScrolledView = (
  panel: ITourismPanelViews,
  view: IRecordPanelProps['view'],
  tab?: string,
): ComponentType<ITourismPanelViewProps> | undefined => {
  if (view === 'new') return panel.New;
  if (view === 'properties') return panel.Properties;
  if (view === 'tab') return tab ? panel.Tabs?.[tab] : undefined;
  if (view === 'detail') return panel.Detail;

  return undefined;
};

export const RecordPanel = ({
  contentType,
  contentId,
  view,
  tab,
}: IRecordPanelProps) => {
  const panel = RECORD_PANELS[contentType];

  if (!panel) {
    return null;
  }

  if (view === 'title') {
    return <TourismPanelHeaderTitle panel={panel} contentId={contentId} />;
  }

  if (view === 'actions') {
    return panel.Actions ? (
      <panel.Actions contentType={contentType} contentId={contentId} />
    ) : null;
  }

  if (view === 'activity') {
    return <TourismPanelActivity contentId={contentId} />;
  }

  const View = getScrolledView(panel, view, tab);

  return View ? (
    <TourismPanelScroll className={TOURISM_PANEL_FIELDS_CLASS_NAME}>
      <View contentType={contentType} contentId={contentId} />
    </TourismPanelScroll>
  ) : null;
};
