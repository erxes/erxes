import { generateModels } from "./connectionResolver";

export default {
  generateInternalNoteNotif: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    let model: any = models.Deals;

    const { contentTypeId, notifDoc, type } = data;

    switch (type) {
      default:
        model = models.Deals;
        break;
    }

    const card = await model.findOne({ _id: contentTypeId });
    const stage = await models.Stages.getStage(card.stageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

    notifDoc.notifType = `${type}Delete`;
    notifDoc.content = `"${card.name}"`;
    notifDoc.link = `/${type}/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${card._id}`;
    notifDoc.contentTypeId = card._id;
    notifDoc.contentType = `${type}`;
    notifDoc.item = card;

    // sendNotificationOfItems on and deal
    notifDoc.notifOfItems = true;

    return notifDoc;
  }
};
