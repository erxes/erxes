import { generateModels } from './connectionResolver';
import { sendCardsMessage } from './messageBroker';
import { IRiskConformityField } from './models/definitions/common';

export default {
  'cards:ticket': ['create'],
  'cards:task': ['create']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, object } = params;
  const { customFieldsData, stageId, _id } = object;
  const models = await generateModels(subdomain);

  if (action === 'create') {
    const stage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: {
        _id: stageId,
        type: type.replace('cards:', '')
      },
      isRPC: true,
      defaultValue: {}
    });

    const [pipeline] = await sendCardsMessage({
      subdomain,
      action: 'pipelines.find',
      data: {
        _id: stage?.pipelineId
      },
      isRPC: true,
      defaultValue: []
    });

    for (const data of customFieldsData) {
      const commonFilter = {
        cardType: type.replace('cards:', ''),
        boardId: pipeline.boardId,
        pipelineId: stage.pipelineId,
        customFieldId: data.field
      };

      const config = await models.RiskAssessmentConfigs.findOne({
        $or: [
          { ...commonFilter, stageId },
          { ...commonFilter, stageId: '' }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(1);

      if (config) {
        const customField = config.configs.find(
          item => item.value === data.value
        );
        if (customField) {
          const conformity = {
            cardId: _id,
            cardType: type.replace('cards:', ''),
            riskAssessmentId: customField.riskAssessmentId
          } as IRiskConformityField;
          await models.RiskConformity.riskConformityAdd(conformity);
        }
      }
    }
  }
};
