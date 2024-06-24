import { IModels } from './connectionResolver';

export const insertImportItems = async (models: IModels, args) => {
  const { docs, contentType } = args;

  try {
    let objects;
    let model;

    switch (contentType) {
      case 'deal':
        model = models.Deals;
        break;
      case 'task':
        model = models.Tasks;
      case 'ticket':
        model = models.Tickets;
      case 'purchase':
        model = models.Purchases;
    }

    objects = await model.insertMany(docs);
    return { objects, updated: 0 };
  } catch (e) {
    return { error: e.message };
  }
};

export const prepareImportDocs = async (models: IModels, args) => {
  const { result, properties, contentType, user } = args;

  const bulkDoc: any = [];

  // Iterating field values
  for (const fieldValue of result) {
    const doc: any = {
      customFieldsData: []
    };

    let colIndex: number = 0;
    let boardName: string = '';
    let pipelineName: string = '';
    let stageName: string = '';

    // Iterating through detailed properties
    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();

      switch (property.type) {
        case 'boardName':
          boardName = value;
          break;

        case 'pipelineName':
          pipelineName = value;
          break;

        case 'stageName':
          stageName = value;
          break;

        case 'basic':
          {
            doc[property.name] = value;

            if (property.name === 'isComplete') {
              doc.isComplete = Boolean(value);
            }
          }
          break;
      }

      colIndex++;
    }

    if (boardName && pipelineName && stageName) {
      doc.userId = user._id;

      const board = await models.Boards.findOne({
        name: boardName,
        type: contentType
      });

      const pipeline = await models.Pipelines.findOne({
        boardId: board && board._id,
        name: pipelineName
      });

      const stage = await models.Stages.findOne({
        pipelineId: pipeline && pipeline._id,
        name: stageName
      });

      doc.stageId = stage ? stage._id : '123';
    }

    bulkDoc.push(doc);
  }

  return bulkDoc;
};
