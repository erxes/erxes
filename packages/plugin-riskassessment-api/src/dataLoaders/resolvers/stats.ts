import { IContext } from '../../connectionResolver';
import { sendCardsMessage } from '../../messageBroker';

export default {
  async resolvedCardCount({ ids }, {}, { models, subdomain }: IContext) {
    const riskAssessments = await models.RiskAssessments.find({
      _id: { $in: ids }
    })
      .select({ cardId: 1, cardType: 1 })
      .lean();

    const listCardObj: { type: string; ids: string[] }[] = [];

    for (const { cardId, cardType } of riskAssessments) {
      const obj = (listCardObj || []).find(obj => obj?.type === cardType);

      if (!obj) {
        return listCardObj.push({ type: cardType, ids: [cardId] });
      }

      listCardObj.map(cardObj =>
        cardObj.type === cardType
          ? { ...cardObj, ids: [...cardObj.ids, cardId] }
          : cardObj
      );
    }

    const stages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        probability: 'Resolved',
        status: 'active'
      },
      isRPC: true,
      defaultValue: []
    });

    const stageIds = stages.map(stage => stage._id);

    let resolvedCardCount = 0;

    for (const { type, ids } of listCardObj) {
      const cards = await sendCardsMessage({
        subdomain,
        action: `${type}s.find`,
        data: {
          _id: { $in: ids },
          stageId: { $in: stageIds }
        },
        isRPC: true,
        defaultValue: []
      });

      const cardsCount = cards.length;

      resolvedCardCount += cardsCount;
    }

    return resolvedCardCount;
  }
};
