import { IRiskConformityDocument } from '../../models/definitions/confimity';
import { IContext, models } from '../../connectionResolver';
import { sendCardsMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskConformity.findOne({ _id });
  },

  async riskIndicators({ riskIndicatorIds }: IRiskConformityDocument) {
    const indicators = await models?.RiskIndicators.find({
      _id: { $in: riskIndicatorIds }
    });

    const riskIndicators = await models?.RiskAssessmentIndicators.find({
      indicatorId: { $in: riskIndicatorIds }
    }).lean();

    for (const riskIndicator of riskIndicators || []) {
      const indicator = indicators?.find(
        indicator => indicator.id === riskIndicator.indicatorId
      );
      riskIndicator.detail = indicator;
    }

    return riskIndicators;
  },
  async riskAssessment(
    riskConformity: IRiskConformityDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (riskConformity.riskAssessmentId &&
        dataLoaders.riskAssessments.load(riskConformity.riskAssessmentId)) ||
      null
    );
  },
  async card(
    riskConformity: IRiskConformityDocument,
    {},
    { subdomain }: IContext
  ) {
    if (riskConformity.cardId) {
      const [cardDetail] = await sendCardsMessage({
        subdomain,
        action: `${riskConformity.cardType}s.find`,
        data: {
          _id: riskConformity.cardId
        },
        isRPC: true,
        defaultValue: []
      });
      if (!cardDetail) {
        return null;
      }
      return cardDetail;
    }
    return null;
  }
};
