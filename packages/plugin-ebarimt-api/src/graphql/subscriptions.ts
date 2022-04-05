export default {
  automationResponded: (payload, variables) => {
    return (
      payload.automationResponded.userId === variables.userId &&
      payload.automationResponded.sessionCode === variables.sessionCode
    );
  },
};
