const emailTemplates = `
  query emailTemplates {
    emailTemplates {
      _id
      name
      content
    }
  }
`;

const totalCount = `
  query totalEmailTemplatesCount {
    emailTemplatesTotalCount
  }
`;

export default {
  emailTemplates,
  totalCount
};
