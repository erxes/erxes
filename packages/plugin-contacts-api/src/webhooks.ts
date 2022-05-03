export default {
  actions: [
    { label: 'Customer created', action: 'create', type: 'customer' },
    { label: 'Customer updated', action: 'update', type: 'customer' },
    { label: 'Customer deleted', action: 'delete', type: 'customer' },
    { label: 'Company created', action: 'create', type: 'company' },
    { label: 'Company updated', action: 'update', type: 'company' },
    { label: 'Company deleted', action: 'delete', type: 'company' }
  ],
  getInfo: ({ data: { data, actionText, contentType } }) => {
    return {
      url: `/${contentType}/details/${data.object._id}`,
      content: `${contentType === 'customer' ? 'Customer' : 'Company'} ${actionText}`
    }
  }
};
