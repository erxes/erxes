import { gql } from '@apollo/client';

export const TOUR_CUSTOM_TYPES = gql`
  query TourismTourCustomTypes($branchId: String) {
    bmsCustomTourTypes(branchId: $branchId) {
      _id
      branchId
      code
      label
      name
      pluralLabel
      description
      isActive
    }
  }
`;

export const TOUR_CUSTOM_FIELD_GROUPS = gql`
  query TourismTourCustomFieldGroups($branchId: String!) {
    bmsCustomTourGroupList(branchId: $branchId) {
      list {
        _id
        branchId
        label
        code
        parentId
        order
        customTourTypeIds
        enabledTourIds
        fields
      }
    }
  }
`;

export const TOUR_CUSTOM_TYPE_ADD = gql`
  mutation BmsCustomTourTypesAdd($input: CustomTourTypeInput!) {
    bmsCustomTourTypesAdd(input: $input) {
      _id
      branchId
      code
      label
      name
      pluralLabel
      description
      isActive
    }
  }
`;

export const TOUR_CUSTOM_TYPE_EDIT = gql`
  mutation BmsCustomTourTypesEdit(
    $_id: String!
    $input: CustomTourTypeInput!
  ) {
    bmsCustomTourTypesEdit(_id: $_id, input: $input) {
      _id
      branchId
      code
      label
      name
      pluralLabel
      description
      isActive
    }
  }
`;

export const TOUR_CUSTOM_TYPE_REMOVE = gql`
  mutation BmsCustomTourTypesRemove($_id: String!) {
    bmsCustomTourTypesRemove(_id: $_id)
  }
`;

export const TOUR_CUSTOM_FIELD_GROUP_ADD = gql`
  mutation BmsCustomTourGroupsAdd($input: CustomTourFieldGroupInput!) {
    bmsCustomTourGroupsAdd(input: $input) {
      _id
    }
  }
`;

export const TOUR_CUSTOM_FIELD_GROUP_EDIT = gql`
  mutation BmsCustomTourGroupsEdit(
    $_id: String!
    $input: CustomTourFieldGroupInput!
  ) {
    bmsCustomTourGroupsEdit(_id: $_id, input: $input) {
      _id
    }
  }
`;

export const TOUR_CUSTOM_FIELD_GROUP_REMOVE = gql`
  mutation BmsCustomTourGroupsRemove($_id: String!) {
    bmsCustomTourGroupsRemove(_id: $_id)
  }
`;
