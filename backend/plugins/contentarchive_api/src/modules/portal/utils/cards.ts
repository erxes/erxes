
import { IModels } from '~/connectionResolvers';



export const createCard = async (models, cpUser, doc) => {
  //TODO: fix
  // const customer = await sendCoreMessage({
  //   subdomain,
  //   action: 'customers.findOne',
  //   data: {
  //     _id: cpUser.erxesCustomerId,
  //   },
  //   isRPC: true,
  // });
  // if (!customer) {
  //   throw new Error('Customer not registered');
  // }
  // const {
  //   type,
  //   subject,
  //   description,
  //   stageId,
  //   parentId,
  //   closeDate,
  //   startDate,
  //   customFieldsData,
  //   attachments,
  //   labelIds,
  //   productsData,
  // } = doc;
  // let priority = doc.priority;
  // if (['High', 'Critical'].includes(priority)) {
  //   priority = 'Normal';
  // }
  // let card = {} as any;
  // const data = {
  //   userId: cpUser.userId,
  //   name: subject,
  //   description,
  //   priority,
  //   stageId,
  //   status: 'active',
  //   customerId: customer._id,
  //   createdAt: new Date(),
  //   stageChangedDate: null,
  //   parentId,
  //   closeDate,
  //   startDate,
  //   customFieldsData,
  //   attachments,
  //   labelIds,
  //   productsData,
  // };
  // switch (type) {
  //   case 'deal':
  //     card = await sendSalesMessage({
  //       subdomain,
  //       action: `${type}s.create`,
  //       data,
  //       isRPC: true,
  //     });
  //     break;
  //   case 'ticket':
  //     card = await sendTicketsMessage({
  //       subdomain,
  //       action: `${type}s.create`,
  //       data,
  //       isRPC: true,
  //     });
  //     break;
  //   case 'task':
  //     card = await sendTasksMessage({
  //       subdomain,
  //       action: `${type}s.create`,
  //       data,
  //       isRPC: true,
  //     });
  //     break;
  //   case 'purchase':
  //     card = await sendPurchasesMessage({
  //       subdomain,
  //       action: `${type}s.create`,
  //       data,
  //       isRPC: true,
  //     });
  //     break;
  // }
  // await models.ClientPortalUserCards.createOrUpdateCard({
  //   contentType: type,
  //   contentTypeId: card._id,
  //   portalUserId: cpUser.userId,
  // });
  // return card;
};

export const participantEditRelation = async (
  models: IModels,
  type,
  cardId,
  oldportalUserIds,
  portalUserIds,
) => {
  const userCards = await models.UserCards.find({
    contentType: type,
    contentTypeId: cardId,
  });
  const newCpUsers = portalUserIds.filter(
    (x) => userCards.findIndex((m) => m.portalUserId === x) === -1,
  );

  const excludedCpUsers = oldportalUserIds.filter(
    (m) => !portalUserIds.includes(m),
  );

  if (newCpUsers) {
    const docs = newCpUsers.map((d) => ({
      contentType: type,
      contentTypeId: cardId,
      portalUserId: d,
    }));
    await models.UserCards.insertMany(docs);
  }
  if (excludedCpUsers) {
    await models.UserCards.deleteMany({
      contentType: type,
      contentTypeId: cardId,
      portalUserId: { $in: excludedCpUsers },
    });
  }

  return 'ok';
};




export const getUserCards = async (
  userId: string,
  contentType: string,
  models: IModels,
) => {
  const cardIds = await models.UserCards.find({
    cpUserId: userId,
    contentType,
  }).distinct('contentTypeId');

  // const message = {
  //   subdomain,
  //   action: `${contentType}s.find`,
  //   data: {
  //     _id: { $in: cardIds },
  //   },
  //   isRPC: true,
  //   defaultValue: [],
  // };

  const cards = [];

  // switch (contentType) {
  //   case 'deal':
  //     cards = await sendSalesMessage(message);
  //     break;
  //   case 'task':
  //     cards = await sendTasksMessage(message);
  //     break;
  //   case 'ticket':
  //     cards = await sendTicketsMessage(message);
  //     break;
  //   case 'purchase':
  //     cards = await sendPurchasesMessage(message);
  //     break;
  // }

  return cards;
};
