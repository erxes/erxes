import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IRecordPanelProps, NEW_RECORD_ID } from 'ui-modules';
import { TourismPanelActivity } from '@/tms/side-panel/TourismPanelLayout';
import {
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

const RECORD_PANELS: Record<string, ITourismPanelViews> = {
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

const TourismPanelScroll = ({ children }: { children: ReactNode }) => (
  <div className="contents [&_.overflow-y-auto]:styled-scroll">{children}</div>
);

const TourismPanelTitle = ({ label }: { label: string }) => {
  const { t } = useTranslation('tourism');

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

  const { New, Actions, Detail, Properties } = panel;

  if (view === 'new') {
    return New ? (
      <TourismPanelScroll>
        <New contentType={contentType} contentId={contentId} />
      </TourismPanelScroll>
    ) : null;
  }

  if (view === 'title') {
    return (
      <TourismPanelTitle
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
    return <TourismPanelActivity contentId={contentId} />;
  }

  if (view === 'properties') {
    return Properties ? (
      <TourismPanelScroll>
        <Properties contentType={contentType} contentId={contentId} />
      </TourismPanelScroll>
    ) : null;
  }

  return (
    <TourismPanelScroll>
      <Detail contentType={contentType} contentId={contentId} />
    </TourismPanelScroll>
  );
};
