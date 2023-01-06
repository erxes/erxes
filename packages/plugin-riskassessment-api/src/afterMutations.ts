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

    const commonFilter = {
      cardType: type.replace('cards:', ''),
      boardId: pipeline.boardId,
      pipelineId: stage.pipelineId
    };

    const addedConformities: any[] = [];
    const conformity = {
      cardId: _id,
      cardType: type.replace('cards:', '')
    } as IRiskConformityField;

    for (const data of customFieldsData) {
      const config = await models.RiskAssessmentConfigs.findOne({
        $or: [
          { ...commonFilter, stageId, customFieldId: data.field },
          { ...commonFilter, stageId: '', customFieldId: data.field }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(1);
      if (config) {
        const customField = config.configs.find(
          item => item.value === data.value
        );
        if (customField) {
          const addedConformity = await models.RiskConformity.riskConformityAdd(
            { ...conformity, riskAssessmentId: customField.riskAssessmentId }
          );
          addedConformities.push(addedConformity);
        }
      }
    }

    if (!addedConformities.length) {
      const filter = { ...commonFilter, customFieldId: null, configs: [] };

      const config = await models.RiskAssessmentConfigs.findOne({
        $or: [
          { ...filter, stageId },
          { ...filter, stageId: '' }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(1);
      if (config?.riskAssessmentId) {
        await models.RiskConformity.riskConformityAdd({
          ...conformity,
          riskAssessmentId: String(config?.riskAssessmentId)
        });
      }
    }
  }
};
