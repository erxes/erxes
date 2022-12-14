import { IRiskConformityDocument } from '../../models/definitions/confimity';
import { IContext } from '../../connectionResolver';
import { sendCardsMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessment.findOne({ _id });
  },

  async riskAssessment(riskConformity: IRiskConformityDocument, {}, { dataLoaders }: IContext) {
    return (
      (riskConformity.riskAssessmentId &&
        dataLoaders.riskAssessment.load(riskConformity.riskAssessmentId)) ||
      null
    );
  },
  async card(riskConformity: IRiskConformityDocument, {}, { subdomain }: IContext) {
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
