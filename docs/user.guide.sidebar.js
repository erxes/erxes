module.exports = {
  "user-guide": [
    'user-guide/user-guide',
    'user-guide/get-started',
    {
      type: 'category',
      label: 'Products',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
      'user-guide/products/pos', 
      'user-guide/products/health', 
      'user-guide/products/messenger',
      'user-guide/products/knowledgebase',
      'user-guide/products/sentimental',
      'user-guide/products/webbuilder'
     ]
    },
    {
      type: 'category',
      label: 'Intustries',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
      'user-guide/industries/estate', 
      'user-guide/industries/property', 
      'user-guide/industries/hospitality', 
      'user-guide/industries/yoga', 
      'user-guide/industries/dentist', 
      'user-guide/industries/carrepair', 
      'user-guide/industries/vacation', 
      'user-guide/industries/saas', 
      'user-guide/industries/banking', 
      'user-guide/industries/retail', 
     ]
    },
    {
      type: 'category',
      label: 'Teams',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
      'user-guide/teams/marketing', 
      'user-guide/teams/sales', 
      'user-guide/teams/support', 
      'user-guide/teams/hr', 
      'user-guide/teams/pm', 
      'user-guide/teams/rm',
     ]
    },
  ]
}