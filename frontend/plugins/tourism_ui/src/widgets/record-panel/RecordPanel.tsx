import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IRecordPanelProps, NEW_RECORD_ID } from 'ui-modules';
import { TourismPanelIdentity } from '@/tms/side-panel/TourismPanelIdentity';
import { TourismPanelActivity } from '@/tms/side-panel/TourismPanelLayout';
import {
  ITourismPanelHeading,
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
  <div className="mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col [&_.overflow-y-auto]:styled-scroll">
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

const TourismPanelRecordIdentity = ({
  contentId,
  useHeading,
}: {
  contentId: string;
  useHeading: TUseHeading;
}) => {
  const heading = useHeading(contentId);

  return heading.name ? <TourismPanelIdentity {...heading} /> : null;
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

  const { New, useHeading, Actions, Detail, Properties, Tabs } = panel;

  if (view === 'new') {
    return New ? (
      <TourismPanelScroll>
        <New contentType={contentType} contentId={contentId} />
      </TourismPanelScroll>
    ) : null;
  }

  if (view === 'title') {
    if (contentId === NEW_RECORD_ID) {
      return <TourismPanelTitle label={panel.addLabel} />;
    }

    return useHeading ? (
      <TourismPanelRecordTitle
        contentId={contentId}
        label={panel.editLabel}
        useHeading={useHeading}
      />
    ) : (
      <TourismPanelTitle label={panel.editLabel} />
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

  if (view === 'tab') {
    const TabView = tab ? Tabs?.[tab] : undefined;

    return TabView ? (
      <TourismPanelScroll>
        <TabView contentType={contentType} contentId={contentId} />
      </TourismPanelScroll>
    ) : null;
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
      {useHeading && (
        <TourismPanelRecordIdentity
          contentId={contentId}
          useHeading={useHeading}
        />
      )}
      <Detail contentType={contentType} contentId={contentId} />
    </TourismPanelScroll>
  );
};
