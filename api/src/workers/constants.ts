export const PLUGINS = [
  {
    pluginType: 'deal',
    MONGO_URL: 'mongodb://localhost/erxes-sales',
    collection: 'deals',
    prepareDocCommand: `

    for (const fieldValue of result) {
      let doc = {
        customFieldsData: []
      };
  
      let colIndex = 0
      let boardName= '';
      let pipelineName = '';
      let stageName = '';
  
      doc.userId = user._id;
      doc.stageId = '69fC6rwqMyHNggKPP';

  
      bulkDoc.push(doc);
    }

    `
  }
];
