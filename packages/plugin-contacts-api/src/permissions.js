module.exports = {
    companies: {
      name: 'companies',
      description: 'Companies',
      actions: [
        {
          name: 'companiesAll',
          description: 'All',
          use: [
            'companiesAdd',
            'companiesEdit',
            'companiesRemove',
            'companiesMerge',
            'showCompanies',
            'showCompaniesMain',
            'exportCompanies'
          ]
        },
        {
          name: 'companiesAdd',
          description: 'Add companies'
        },
        {
          name: 'companiesEdit',
          description: 'Edit companies'
        },
        {
          name: 'companiesRemove',
          description: 'Remove companies'
        },
        {
          name: 'companiesMerge',
          description: 'Merge companies'
        },
        {
          name: 'showCompanies',
          description: 'Show companies'
        },
        {
          name: 'showCompaniesMain',
          description: 'Show companies main'
        },
        {
          name: 'exportCompanies',
          description: 'Export companies to xls file'
        }
      ]
    },
    customers: {
      name: 'customers',
      description: 'Customers',
      actions: [
        {
          name: 'customersAll',
          description: 'All',
          use: [
            'showCustomers',
            'customersAdd',
            'customersEdit',
            'customersMerge',
            'customersRemove',
            'exportCustomers',
            'customersChangeState'
          ]
        },
        {
          name: 'exportCustomers',
          description: 'Export customers'
        },
        {
          name: 'showCustomers',
          description: 'Show customers'
        },
        {
          name: 'customersAdd',
          description: 'Add customer'
        },
        {
          name: 'customersEdit',
          description: 'Edit customer'
        },
        {
          name: 'customersMerge',
          description: 'Merge customers'
        },
        {
          name: 'customersRemove',
          description: 'Remove customers'
        },
        {
          name: 'customersChangeState',
          description: 'Change customer state'
        }
      ]
    }
  }