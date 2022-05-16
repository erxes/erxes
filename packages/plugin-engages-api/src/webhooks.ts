export default {
  actions: [
    { label: 'Campaign', action: 'create', type: 'engages:engageMessages' }
  ],
  getInfo: ({ data: { data } }) => {
    let url = `/campaigns/show/${data._id}`;

    if (data.method === 'messenger') {
      url = `/campaigns/edit/${data.$_id}`;
    }

    return {
      url,
      content: 'Campaign has been created'
    };
  }
};
