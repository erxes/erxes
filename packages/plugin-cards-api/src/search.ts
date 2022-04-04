import { doSearch } from "@erxes/api-utils/src/core";
import { generateModels, IModels } from "./connectionResolver";
import { es } from "./configs";

const searchBoardItems = async (models: IModels, index, value) => {
  const items = await doSearch({
    fetchEs: es.fetchElk,
    index,
    value,
    fields: ["name", "description"],
  });

  const updatedItems: any = [];

  for (const item of items) {
    const stage = (await models.Stages.findOne({
      _id: item.source.stageId,
    })) || {
      pipelineId: "",
    };

    const pipeline = (await models.Pipelines.findOne({
      _id: stage.pipelineId,
    })) || { boardId: "" };

    item.source.pipelineId = stage.pipelineId;
    item.source.boardId = pipeline.boardId;

    updatedItems.push(item);
  }

  return updatedItems;
};

const search = async ({ subdomain, data: { value } }) => {
  const models = await generateModels(subdomain);

  return [
    {
      module: "tasks",
      items: await searchBoardItems(models, "tasks", value),
    },
    {
      module: "tickets",
      items: await searchBoardItems(models, "tickets", value),
    },
    {
      module: "deals",
      items: await searchBoardItems(models, "deals", value),
    },
    {
      module: "stages",
      items: await doSearch({
        fetchEs: es.fetchElk,
        index: "stages",
        value,
        fields: ["name"],
      }),
    },
    {
      module: "pipelines",
      items: await doSearch({
        fetchEs: es.fetchElk,
        index: "pipelines",
        value,
        fields: ["name"],
      }),
    },
  ];
};

export default search;
