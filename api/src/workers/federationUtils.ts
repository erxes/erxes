export const PLUGINS = [
  {
    pluginName: 'deal',
    mongoUrl: 'mongodb://localhost/erxes-sales',
    customCommand: `
    
    
    
    `
  }
];

export const getPluginCollection = async () => {
  for (const fieldValue of result) {
    let doc: any = {
      customFieldsData: []
    };

    let colIndex = 0;
    let boardName = '';
    let pipelineName = '';
    let stageName = '';

    for (const property of properties) {
      let value = (fieldValue[colIndex] || '').toString();

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
      }

      colIndex++;
    }

    doc.userId = user._id;

    if (boardName && pipelineName && stageName) {
      let board = await db.collection('boards').findOne({
        name: boardName,
        type: contentType
      });
      let pipeline = await db.collection('pipelines').findOne({
        boardId: board && board._id,
        name: pipelineName
      });
      let stage = await db.collection('stages').findOne({
        pipelineId: pipeline && pipeline._id,
        name: stageName
      });

      doc.stageId = stage && stage._id;
    }

    bulkDoc.push(doc);
  }
};
