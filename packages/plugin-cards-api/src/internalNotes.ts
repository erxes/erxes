import { generateModels } from './connectionResolver';

export default {
  generateInternalNoteNotif: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    let model: any = models.GrowthHacks;

    const { contentTypeId, notifDoc, type } = data;

    if (type === 'growthHack') {
      const hack = await model.getGrowthHack(contentTypeId);

      notifDoc.content = `${hack.name}`;

      return notifDoc;
    }

    switch (type) {
      case 'deal':
        model = models.Deals;
        break;
      case 'task':
        model = models.Tasks;
        break;
      case 'purchase':
        model = models.Purchases;
        break;
      default:
        model = models.Tickets;
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

    // sendNotificationOfItems on ticket, task, purchase and deal
    notifDoc.notifOfItems = true;

    return notifDoc;
  }
};
