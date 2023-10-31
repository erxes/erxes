export default {
  dependentServices: [{ name: 'exmfeed', twoWay: true }],

  contentTypes: [
    {
      type: 'emojis',
      description: 'Emojis',
      sIndex: 'emojis',
      hideInSidebar: true
    },
    {
      type: 'comments',
      description: 'Commnents',
      sIndex: 'comments',
      hideInSidebar: true
    }
  ]
};
