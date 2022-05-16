module.exports = {
  emailTemplates: {
    name: 'emailTemplates',
    description: 'Email template',
    actions: [
      {
        name: 'emailTemplateAll',
        description: 'All',
        use: ['showEmailTemplates', 'manageEmailTemplate']
      },
      {
        name: 'manageEmailTemplate',
        description: 'Manage email template'
      },
      {
        name: 'showEmailTemplates',
        description: 'Show email templates'
      }
    ]
  }, 
}