export default {
  actions: [
    { label: 'Customer created', action: 'create', type: 'contacts:customer' },
    { label: 'Customer updated', action: 'update', type: 'contacts:customer' },
    { label: 'Customer deleted', action: 'delete', type: 'contacts:customer' },
    { label: 'Company created', action: 'create', type: 'contacts:company' },
    { label: 'Company updated', action: 'update', type: 'contacts:company' },
    { label: 'Company deleted', action: 'delete', type: 'contacts:company' }
  ],
  getInfo: ({ data: { data, actionText, contentType } }) => {
    return {
      url: `/${contentType}/details/${data.object._id}`,
      content: `${
        contentType === 'customer' ? 'Customer' : 'Company'
      } ${actionText}`
    };
  }
};
