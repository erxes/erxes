import { generateConditionStageIds } from "./utils";

export default {
  indexesTypeContentType: {
    deal: "deals",
    ticket: "tickets",
    task: "tasks",
  },

  contentTypes: ["deal", "ticket", "task"],

  descriptionMap: {
    deal: "Deal",
    ticket: "Ticket",
    task: "Task",
    customer: 'Customer',
    company: 'Company'
  },

  propertyConditionExtender: async ({ condition }) => {
    let positive;

    const stageIds = await generateConditionStageIds({
      boardId: condition.boardId,
      pipelineId: condition.pipelineId,
    });

    if (stageIds.length > 0) {
      positive = {
        terms: {
          stageId: stageIds,
        },
      };
    }

    return { data: { positive }, status: "success" };
  },

  associationTypes: async ({ mainType }) => {
    let types: string[] = [];

    if (mainType === "deal") {
      types = ["customer", "company", "ticket", "task"];
    }

    if (mainType === "task") {
      types = ["customer", "company", "ticket", "deal"];
    }

    if (mainType === "ticket") {
      types = ["customer", "company", "deal", "task"];
    }

    return { data: types, status: "success" };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: "success" };
  },

  initialSelector: async ({ segment, options }) => {
    let positive;

    const stageIds = await generateConditionStageIds({
      boardId: segment.boardId,
      pipelineId: segment.pipelineId,
      options,
    });

    if (stageIds.length > 0) {
      positive = { terms: { stageId: stageIds } };
    }

    return { data: { positive }, status: "success" };
  },
};
