import { isEnabled } from '@erxes/ui/src/utils/core';

export const commonFields = `
  brandId
  name
  kind
  code
  brand {
    _id
    name
    code
  }
  channels {
    _id
    name
  }
  languageCode
  leadData
  formId
  ${
    isEnabled('tags')
      ? `
      tags {
        _id
        name
        colorCode
      }
  `
      : ``
  }
  tagIds
  form {
    _id
    title
    code
    description
    type
    buttonText
    numberOfPages
    createdDate
    createdUserId
    createdUser {
      _id
      details {
        avatar
        fullName
        position
      }
    }
  }
  isActive

  visibility
  departmentIds
`;

const integrations = `
  query leadIntegrations($perPage: Int, $page: Int, $kind: String, $tag: String, $brandId: String, $status: String, $sortField: String, $sortDirection: Int, $searchValue: String) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag, brandId: $brandId, status: $status, sortField: $sortField, sortDirection: $sortDirection, searchValue: $searchValue) {
      _id
      ${commonFields}
    }
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      ${commonFields}
    }
  }
`;

const integrationsTotalCount = `
  query integrationsTotalCount($kind: String, $tag: String, $brandId: String, $status: String){
    integrationsTotalCount(kind:$kind, tag:$tag, brandId: $brandId, status: $status){
      byKind
      byTag
      byBrand
      byStatus
      total
    }
  }
`;
const tags = `
  query tags($type: String) {
    ${
      isEnabled('tags')
        ? `
        tags(type: $type) {
          _id
          name
          type
          colorCode
        }
    `
        : ``
    }
  }
`;

const forms = `
  query forms {
    forms {
      _id
      title
    }
  }
`;

const emailTemplates = `
  query emailTemplates($page: Int, $perPage: Int) {
    emailTemplates(page: $page, perPage: $perPage) {
      _id
      name
      content
    }
  }
`;

const templateTotalCount = `
  query emailTemplatesTotalCount {
    emailTemplatesTotalCount
  }
`;

export default {
  integrations,
  integrationDetail,
  integrationsTotalCount,
  tags,
  forms,
  emailTemplates,
  templateTotalCount
};
