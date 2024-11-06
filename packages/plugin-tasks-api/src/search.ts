import { doSearch } from "@erxes/api-utils/src/elasticsearch";
import { generateModels, IModels } from "./connectionResolver";

const searchBoardItems = async (
  models: IModels,
  subdomain: string,
  index: string,
  value
) => {
  const items = await doSearch({
    subdomain,
    index,
    value,
    fields: ["name", "description", "number"]
  });

  const updatedItems: any = [];

  for (const item of items) {
    const stage = (await models.Stages.findOne({
      _id: item.source.stageId
    })) || {
      pipelineId: ""
    };

    const pipeline = (await models.Pipelines.findOne({
      _id: stage.pipelineId
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
      items: await searchBoardItems(models, subdomain, "tasks", value)
    },
    {
      module: "stages",
      items: await doSearch({
        subdomain,
        index: "tasks_stages",
        value,
        fields: ["name"]
      })
    },
    {
      module: "pipelines",
      items: await doSearch({
        subdomain,
        index: "tasks_pipelines",
        value,
        fields: ["name"]
      })
    }
  ];
};

export default search;
