import { isEnabled } from '@erxes/ui/src/utils/core';

const accountFields = `
  _id
  name
  type
  code
  journal
  currency
  categoryId
  isBalance,
  closePercent,
  createdAt
  category {
    _id
    code
    status
    name
  }
  accountCount
`;

const accounts = `
  query accounts(
    $type: String,
    $categoryId: String,
    $tag: String,
    $searchValue: String,
    $perPage: Int,
    $page: Int $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $segment: String,
    $segmentData: String
  ) {
    accounts(
      type: $type,
      categoryId: $categoryId,
      tag: $tag,
      searchValue: $searchValue,
      perPage: $perPage,
      page: $page ids: $ids,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      segment: $segment,
      segmentData: $segmentData
    ) {
      ${accountFields}
    }
  }
`;

const accountDetail = `
  query accountDetail($_id: String) {
    accountDetail(_id: $_id) {
      ${accountFields}
      customFieldsData
    }
  }
`;

const accountCategories = `
  query accountCategories($status: String) {
    accountCategories(status: $status) {
      _id
      name
      order
      code
      parentId
      status
      isRoot
      accountCount
    }
  }
`;

export default {
  accountFields,
  accounts,
  accountDetail,
  accountCategories
};
