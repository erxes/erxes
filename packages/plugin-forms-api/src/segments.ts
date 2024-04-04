export default {
  dependentServices: [{ name: 'contacts', twoWay: true }],

  contentTypes: [
    {
      type: 'form_submission',
      description: 'Form submission',
      hideInSidebar: true
    }
  ]
};
