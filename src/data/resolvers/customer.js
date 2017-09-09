export default {
  getIntegrationData(customer) {
    return {
      messenger: customer.messengerData || {},
      twitter: customer.twitterData || {},
      facebook: customer.facebookData || {},
    };
  },

  getMessengerCustomData(customer) {
    const results = [];
    const data = customer.messengerData.customData || {};

    Object.keys(data).forEach(key => {
      results.push({
        name: key.replace(/_/g, ' '),
        value: data[key],
      });
    });

    return results;
  },
};
