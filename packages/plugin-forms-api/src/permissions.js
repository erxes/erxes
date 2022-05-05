module.exports = {
  forms: {
    name: 'forms',
    description: 'Form',
    actions: [
      {
        name: 'formsAll',
        description: 'All',
        use: ['showForms', 'manageForms']
      },
      {
        name: 'manageForms',
        description: 'Manage forms'
      },
      {
        name: 'showForms',
        description: 'Show forms'
      }
    ]
  },
}