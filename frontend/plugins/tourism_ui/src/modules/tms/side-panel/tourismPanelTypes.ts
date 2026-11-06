import { ComponentType } from 'react';
import { IconTicket, IconUsers, type Icon } from '@tabler/icons-react';

export const TMS_TOUR_CONTENT_TYPE = 'tourism:tmsTour';
export const TMS_ORDER_CONTENT_TYPE = 'tourism:tmsOrder';
export const TMS_ITINERARY_CONTENT_TYPE = 'tourism:tmsItinerary';
export const TMS_ITINERARY_DUPLICATE_CONTENT_TYPE =
  'tourism:tmsItineraryDuplicate';
export const TMS_ELEMENT_CONTENT_TYPE = 'tourism:tmsElement';
export const TMS_AMENITY_CONTENT_TYPE = 'tourism:tmsAmenity';
export const TMS_CATEGORY_CONTENT_TYPE = 'tourism:tmsCategory';
export const TMS_TOUR_TYPE_CONTENT_TYPE = 'tourism:tmsTourType';
export const TMS_FIELD_GROUP_CONTENT_TYPE = 'tourism:tmsFieldGroup';
export const TMS_CUSTOM_FIELD_CONTENT_TYPE = 'tourism:tmsCustomField';

export const TOURISM_PANEL_CONTENT_TYPES = [
  TMS_TOUR_CONTENT_TYPE,
  TMS_ORDER_CONTENT_TYPE,
  TMS_ITINERARY_CONTENT_TYPE,
  TMS_ITINERARY_DUPLICATE_CONTENT_TYPE,
  TMS_ELEMENT_CONTENT_TYPE,
  TMS_AMENITY_CONTENT_TYPE,
  TMS_CATEGORY_CONTENT_TYPE,
  TMS_TOUR_TYPE_CONTENT_TYPE,
  TMS_FIELD_GROUP_CONTENT_TYPE,
  TMS_CUSTOM_FIELD_CONTENT_TYPE,
];

export interface ITourismPanelTab {
  value: string;
  label: string;
  labelKey?: string;
  icon: Icon;
  after: 'properties';
}

export const TOURISM_PANEL_TABS: Record<string, ITourismPanelTab[]> = {
  [TMS_TOUR_CONTENT_TYPE]: [
    {
      value: 'bookings',
      label: 'Bookings',
      labelKey: 'bookings',
      icon: IconTicket,
      after: 'properties',
    },
    {
      value: 'customers',
      label: 'Customers',
      icon: IconUsers,
      after: 'properties',
    },
  ],
};

export interface ITourismPanelDraftDefaults extends Record<string, unknown> {
  branchId?: string;
  groupId?: string;
  parentId?: string;
}

export interface ITourismPanelViewProps {
  contentType: string;
  contentId: string;
}

export interface ITourismPanelHeading {
  name?: string;
  image?: string;
}

export interface ITourismPanelViews {
  addLabel: string;
  editLabel: string;
  New?: ComponentType<ITourismPanelViewProps>;
  useHeading?: (contentId: string) => ITourismPanelHeading;
  Detail: ComponentType<ITourismPanelViewProps>;
  Actions?: ComponentType<ITourismPanelViewProps>;
  Properties?: ComponentType<ITourismPanelViewProps>;
  Tabs?: Record<string, ComponentType<ITourismPanelViewProps>>;
}
