import { Users } from './apiCollections';
import { Boards, Pipelines, Stages } from './models/Boards';

export const prepareImportDocs = async args => {
  const { result, properties, contentType } = args;

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
        case 'assignedUserEmail':
          {
            const assignedUser = await Users.findOne({ email: value });

            doc[property.name] = assignedUser ? [assignedUser._id] : [];
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
      }

      colIndex++;
    }

    if (boardName && pipelineName && stageName) {
      const board = await Boards.findOne({
        name: boardName,
        type: contentType
      });
      const pipeline = await Pipelines.findOne({
        boardId: board && board._id,
        name: pipelineName
      });
      const stage = await Stages.findOne({
        pipelineId: pipeline && pipeline._id,
        name: stageName
      });

      doc.stageId = stage && stage._id;
    }

    bulkDoc.push(doc);
  }
};
