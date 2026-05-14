import { gql } from '@apollo/client';

export const TOUR_CUSTOM_POST_TYPES = gql`
  query TourismTourCustomPostTypes($branchId: String) {
    bmsTourCustomPostTypes(branchId: $branchId) {
      _id
      code
      label
      pluralLabel
      description
    }
  }
`;

export const TOUR_CUSTOM_FIELD_GROUPS = gql`
  query TourismTourCustomFieldGroups($branchId: String) {
    bmsTourCustomFieldGroupList(branchId: $branchId) {
      list {
        _id
        label
        code
        customPostTypeIds
        enabledTourIds
        enabledTours
        fields
      }
    }
  }
`;
