export default {
  actions: [
    { label: "Customer created", action: "create", type: "core:customer" },
    { label: "Customer updated", action: "update", type: "core:customer" },
    { label: "Customer deleted", action: "delete", type: "core:customer" },
    { label: "Company created", action: "create", type: "core:company" },
    { label: "Company updated", action: "update", type: "core:company" },
    { label: "Company deleted", action: "delete", type: "core:company" }
  ],
  getInfo: ({ data: { data, actionText, contentType } }) => {
    return {
      url: `/${contentType}/details/${data.object._id}`,
      content: `${
        contentType === "customer" ? "Customer" : "Company"
      } ${actionText}`
    };
  }
};
