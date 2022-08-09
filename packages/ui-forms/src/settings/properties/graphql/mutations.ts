const commonFields = `
  $name: String,
  $contentType: String,
  $order: Int,
  $description: String,
  $code: String,
  $isVisible: Boolean,
  $isVisibleInDetail: Boolean,
  $config: JSON,
`;

const commonTypes = `
  name: $name,
  contentType: $contentType,
  order: $order,
  description: $description,
  code: $code,
  isVisible: $isVisible,
  isVisibleInDetail: $isVisibleInDetail,
  config: $config
`;

const updateVisibleFields = `
  $_id: String!, 
  $isVisible: Boolean,
  $isVisibleInDetail: Boolean
`;

const updateVisibleTypes = `
  _id: $_id,
  isVisible: $isVisible,
  isVisibleInDetail: $isVisibleInDetail
`;

const fieldsGroupsAdd = `
  mutation fieldsGroupsAdd(${commonFields}) {
    fieldsGroupsAdd(${commonTypes}) {
      _id
    }
  }
`;

const fieldsGroupsEdit = `
  mutation fieldsGroupsEdit($_id: String!, ${commonFields}) {
    fieldsGroupsEdit(_id: $_id, ${commonTypes}) {
      _id
    }
  }
`;

const fieldsGroupsRemove = `
  mutation fieldsGroupsRemove($_id: String!) {
    fieldsGroupsRemove(_id: $_id)
  }
`;

const fieldsGroupsUpdateVisible = `
  mutation fieldsGroupsUpdateVisible(${updateVisibleFields}) {
    fieldsGroupsUpdateVisible(${updateVisibleTypes}) {
      _id
    }
  }
`;

const commonVariables = `
  $type: String,
  $validation: String,
  $text: String,
  $description: String,
  $options: [String],
  $locationOptions: [LocationOptionInput]
  $isRequired: Boolean,
  $order: Int,
  $groupId: String,
  $isVisible: Boolean,
  $code: String,
  $searchable: Boolean,
  $showInCard: Boolean,
  $objectListConfigs: [objectListConfigInput],
`;

const commonParams = `
  type: $type,
  validation: $validation,
  text: $text,
  description: $description,
  options: $options,
  locationOptions: $locationOptions,
  isRequired: $isRequired,
  order: $order,
  groupId: $groupId,
  isVisible: $isVisible,
  code: $code,
  searchable: $searchable,
  showInCard: $showInCard,
  objectListConfigs: $objectListConfigs,
`;

const fieldsAdd = `
  mutation fieldsAdd(
    $contentType: String!,
    $contentTypeId: String,
    ${commonVariables}
  ) {
      fieldsAdd(
        contentType: $contentType,
        contentTypeId: $contentTypeId,
        ${commonParams}
      ) {
        _id
      }
  }
`;

const fieldsEdit = `
  mutation fieldsEdit($_id: String!, ${commonVariables}) {
    fieldsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const fieldsUpdateSystemFields = `
  mutation fieldsUpdateSystemFields($_id: String!, $isVisibleToCreate: Boolean, $isRequired: Boolean) {
    fieldsUpdateSystemFields(_id: $_id, isVisibleToCreate: $isVisibleToCreate, isRequired: $isRequired) {
      _id
    }
  }
`;

const fieldsRemove = `
  mutation fieldsRemove($_id: String!) {
    fieldsRemove(_id: $_id) {
      _id
    }
  }
`;

const fieldsUpdateVisible = `
  mutation fieldsUpdateVisible(${updateVisibleFields}) {
    fieldsUpdateVisible(${updateVisibleTypes}) {
      _id
    }
  }
`;

const fieldsUpdateOrder = `
  mutation fieldsUpdateOrder($orders: [OrderItem]) {
    fieldsUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const groupsUpdateOrder = `
  mutation fieldsGroupsUpdateOrder($orders: [OrderItem]) {
    fieldsGroupsUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

export default {
  fieldsGroupsAdd,
  fieldsGroupsEdit,
  fieldsGroupsRemove,
  fieldsGroupsUpdateVisible,
  fieldsUpdateSystemFields,
  fieldsAdd,
  fieldsEdit,
  fieldsRemove,
  fieldsUpdateVisible,
  fieldsUpdateOrder,
  groupsUpdateOrder
};
