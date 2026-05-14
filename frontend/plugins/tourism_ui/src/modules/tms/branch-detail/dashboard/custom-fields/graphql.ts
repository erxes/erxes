import { gql } from '@apollo/client';

export const BMS_CUSTOM_TOUR_TYPES = gql`
  query BmsCustomTourTypes($branchId: String) {
    bmsCustomTourTypes(branchId: $branchId) {
      _id
      branchId
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`;

export const BMS_CUSTOM_TOUR_TYPE_ADD = gql`
  mutation BmsCustomTourTypesAdd($input: CustomTourTypeInput!) {
    bmsCustomTourTypesAdd(input: $input) {
      _id
      branchId
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`;

export const BMS_CUSTOM_TOUR_TYPE_EDIT = gql`
  mutation BmsCustomTourTypesEdit(
    $_id: String!
    $input: CustomTourTypeInput!
  ) {
    bmsCustomTourTypesEdit(_id: $_id, input: $input) {
      _id
      branchId
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`;

export const BMS_CUSTOM_TOUR_TYPE_REMOVE = gql`
  mutation BmsCustomTourTypesRemove($_id: String!) {
    bmsCustomTourTypesRemove(_id: $_id)
  }
`;

export const BMS_CUSTOM_TOUR_GROUPS = gql`
  query BmsCustomTourGroupList($branchId: String!) {
    bmsCustomTourGroupList(branchId: $branchId) {
      list {
        _id
        branchId
        label
        code
        customTourTypeIds
        customTourTypes {
          _id
          code
          label
          pluralLabel
        }
        enabledTourIds
        fields
      }
    }
  }
`;

export const BMS_CUSTOM_TOUR_GROUP_ADD = gql`
  mutation BmsCustomTourGroupsAdd($input: CustomTourFieldGroupInput!) {
    bmsCustomTourGroupsAdd(input: $input) {
      _id
      branchId
      label
      code
      customTourTypeIds
      enabledTourIds
      fields
    }
  }
`;

export const BMS_CUSTOM_TOUR_GROUP_EDIT = gql`
  mutation BmsCustomTourGroupsEdit(
    $_id: String!
    $input: CustomTourFieldGroupInput!
  ) {
    bmsCustomTourGroupsEdit(_id: $_id, input: $input) {
      _id
      branchId
      label
      code
      customTourTypeIds
      enabledTourIds
      fields
    }
  }
`;

export const BMS_CUSTOM_TOUR_GROUP_REMOVE = gql`
  mutation BmsCustomTourGroupsRemove($_id: String!) {
    bmsCustomTourGroupsRemove(_id: $_id)
  }
`;
