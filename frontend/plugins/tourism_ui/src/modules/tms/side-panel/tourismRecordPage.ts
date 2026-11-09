import { createContext } from 'react';
import {
  TMS_AMENITY_CONTENT_TYPE,
  TMS_CATEGORY_CONTENT_TYPE,
  TMS_CUSTOM_FIELD_CONTENT_TYPE,
  TMS_ELEMENT_CONTENT_TYPE,
  TMS_FIELD_GROUP_CONTENT_TYPE,
  TMS_ITINERARY_CONTENT_TYPE,
  TMS_ORDER_CONTENT_TYPE,
  TMS_TOUR_CONTENT_TYPE,
  TMS_TOUR_TYPE_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';

const TOURISM_CONTENT_TYPE_PREFIX = 'tourism:';
const TMS_BRANCH_PAGE = /^\/tourism\/tms\/branches\/([^/]+)/;

export const TOURISM_RECORD_SECTIONS: Record<string, string> = {
  [TMS_TOUR_CONTENT_TYPE]: 'tour',
  [TMS_ORDER_CONTENT_TYPE]: 'tour',
  [TMS_ITINERARY_CONTENT_TYPE]: 'itinerary',
  [TMS_ELEMENT_CONTENT_TYPE]: 'elements',
  [TMS_AMENITY_CONTENT_TYPE]: 'amenities',
  [TMS_CATEGORY_CONTENT_TYPE]: 'category',
  [TMS_TOUR_TYPE_CONTENT_TYPE]: 'customFields',
  [TMS_FIELD_GROUP_CONTENT_TYPE]: 'customFields',
  [TMS_CUSTOM_FIELD_CONTENT_TYPE]: 'customFields',
};

export const TOURISM_NEW_RECORD_TYPES = new Set([
  TMS_TOUR_CONTENT_TYPE,
  TMS_ELEMENT_CONTENT_TYPE,
  TMS_AMENITY_CONTENT_TYPE,
  TMS_CATEGORY_CONTENT_TYPE,
  TMS_TOUR_TYPE_CONTENT_TYPE,
  TMS_FIELD_GROUP_CONTENT_TYPE,
  TMS_CUSTOM_FIELD_CONTENT_TYPE,
]);

export const toTourismContentType = (recordType: string) =>
  `${TOURISM_CONTENT_TYPE_PREFIX}${recordType}`;

export const getTourismBranchSectionPath = (
  branchId: string,
  contentType: string,
) =>
  `/tourism/tms/branches/${branchId}?activeTab=${
    TOURISM_RECORD_SECTIONS[contentType] ?? 'tour'
  }`;

export const getTourismRecordDetailPath =
  (contentType: string) => (recordId: string, pathname: string) => {
    const branchId = TMS_BRANCH_PAGE.exec(pathname)?.[1];
    const recordType = contentType.slice(TOURISM_CONTENT_TYPE_PREFIX.length);

    return branchId
      ? `/tourism/tms/branches/${branchId}/records/${recordType}/${recordId}`
      : '/tourism/tms';
  };

export const getTourismRecordNewPath =
  (contentType: string) => (pathname: string) => {
    const branchId = TMS_BRANCH_PAGE.exec(pathname)?.[1];
    const recordType = contentType.slice(TOURISM_CONTENT_TYPE_PREFIX.length);

    return branchId
      ? `/tourism/tms/branches/${branchId}/records/${recordType}/new`
      : '/tourism/tms';
  };

export const TourismRecordPageContext = createContext(false);
