export const inboxFieldQueries = {
  inboxFields() {
    const response: {
      customer?: unknown[];
      conversation?: unknown[];
      device?: unknown[];
    } = {
      customer: [],
      conversation: [],
      device: [],
    };

    return response;
  },
};
