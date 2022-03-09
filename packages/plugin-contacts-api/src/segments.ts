export default {
  indexesTypeContentType: {
    customer: "customers",
    company: "companies",
  },
  contentTypes: ["customer", "company"],
  esTypesMapQueue: "contacts:segments:esTypesMap",
  initialSelectorQueue: "contacts:segments:initialSelector",
  associationTypesQueue: "contacts:segments:associationTypes",

  descriptionMap: {
    deal: "Deal",
    ticket: "Ticket",
    task: "Task",
    customer: "Customer",
    company: "Company",
  },

  associationTypes: async ({ mainType }) => {
    let types: string[] = [];

    if (["customer", "lead"].includes(mainType)) {
      types = ["company", "deal", "ticket", "task"];
    }

    if (mainType === "company") {
      types = ["customer", "deal", "ticket", "task"];
    }

    return { data: types, status: "success" };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: "success" };
  },

  initialSelector: async ({ segment, options }) => {
    const negative = {
      term: {
        status: "deleted",
      },
    };

    return { data: { negative }, status: "success" };
  },
};