export default {
  contentTypes: [
    {
      type: "user",
      description: "Team member",
      esIndex: "users"
    },
    {
      type: "form_submission",
      description: "Form submission",
      hideInSidebar: true
    }
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: "success" };
  },

  initialSelector: async () => {
    const negative = {
      term: {
        status: "deleted"
      }
    };

    return { data: { negative }, status: "success" };
  }
};
