import { generateModels } from './connectionResolver';
import { EXPORT_TYPES, IMPORT_TYPES } from './constants';
import { sendFormsMessage } from './messageBroker';

export default {
  importTypes: IMPORT_TYPES,
  exportTypes: EXPORT_TYPES,
  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs, contentType } = data;

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
      }

      objects = await model.insertMany(docs);
      return { objects, updated: 0 };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { result, properties, contentType, user } = data;

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

        switch (property.name) {
          case 'customProperty':
            {
              doc.customFieldsData.push({
                field: property.id,
                value: fieldValue[colIndex]
              });

              doc.customFieldsData = await sendFormsMessage({
                subdomain,
                action: 'fields.prepareCustomFieldsData',
                data: doc.customFieldsData,
                isRPC: true
              });
            }
            break;

          case 'boardName':
            boardName = value;
            break;

          case 'pipelineName':
            pipelineName = value;
            break;

          case 'stageName':
            stageName = value;
            break;

          case 'labels':
            const label = await models.PipelineLabels.findOne({
              name: value
            });

            doc.labelIds = label ? [label._id] : '';

            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === 'createdAt' && value) {
                doc.createdAt = new Date(value);
              }

              if (property.name === 'modifiedAt' && value) {
                doc.modifiedAt = new Date(value);
              }

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

        doc.stageId = stage ? stage._id : '';
      }

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};
