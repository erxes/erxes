import { isEnabled } from '@erxes/ui/src/utils/core';

const emailTemplates = `
  query emailTemplates($page: Int, $perPage: Int, $searchValue: String,$tag: String) {
    emailTemplates(page: $page, perPage: $perPage, searchValue: $searchValue, tag:$tag) {
      _id
      name
      content
      createdAt
      status
      modifiedAt
      ${
        isEnabled('tags')
          ? `tags {
        _id
        name
        colorCode
      }`
          : ''
      }
      createdUser {
        _id
        username
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const totalCount = `
  query emailTemplatesTotalCount($searchValue: String) {
    emailTemplatesTotalCount(searchValue: $searchValue)
  }
`;

const emailTemplatesCountTagQuery = `
  query emailTemplateCountsByTags($type: String) {
    emailTemplateCountsByTags(type: $type)
  }
`;

export default {
  emailTemplates,
  emailTemplatesCountTagQuery,
  totalCount
};
