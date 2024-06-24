import { doSearch } from '@erxes/api-utils/src/elasticsearch';
import { generateModels, IModels } from './connectionResolver';

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
    fields: ['name', 'description', 'number']
  });

  const updatedItems: any = [];

  for (const item of items) {
    const stage = (await models.Stages.findOne({
      _id: item.source.stageId
    })) || {
      pipelineId: ''
    };

    const pipeline = (await models.Pipelines.findOne({
      _id: stage.pipelineId
    })) || { boardId: '' };

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
      module: 'tasks',
      items: await searchBoardItems(models, subdomain, 'tasks', value)
    },
    {
      module: 'tickets',
      items: await searchBoardItems(models, subdomain, 'tickets', value)
    },
    {
      module: 'deals',
      items: await searchBoardItems(models, subdomain, 'deals', value)
    },
    {
      module: 'purchases',
      items: await searchBoardItems(models, subdomain, 'purchases', value)
    },
    {
      module: 'stages',
      items: await doSearch({
        subdomain,
        index: 'stages',
        value,
        fields: ['name']
      })
    },
    {
      module: 'pipelines',
      items: await doSearch({
        subdomain,
        index: 'pipelines',
        value,
        fields: ['name']
      })
    }
  ];
};

export default search;
