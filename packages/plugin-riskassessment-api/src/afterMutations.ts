import { generateModels } from './connectionResolver';
import { sendCardsMessage } from './messageBroker';

export default {
  'cards:ticket': ['create', 'update', 'delete'],
  'cards:task': ['create', 'update', 'delete']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, object, newData, user } = params;
  const { customFieldsData, stageId, _id, branchIds, departmentIds } = object;
  const models = await generateModels(subdomain);

  if (
    ['create', 'update'].includes(action) &&
    (newData?.customFieldsData || []).find(
      field => field?.extraValue === 'riskAssessmentVisitors'
    )
  ) {
    await handleVistors({
      subdomain,
      object,
      newData,
      user,
      customFieldsData,
      type
    });
    return;
  }

  if (action === 'create') {
    await handleConfig({ models, subdomain, params });
    return;
  }

  if (action === 'delete') {
    const riskAssessment = await models.RiskAssessments.findOne({
      cardId: _id
    });

    if (riskAssessment) {
      await models.RiskAssessments.removeRiskAssessment(riskAssessment._id);
    }

    return;
  }
};

const handleVistors = async ({
  subdomain,
  object,
  user,
  type,
  customFieldsData,
  newData
}) => {
  const contentType = type.replace('cards:', '');

  const oldVisitorIds =
    customFieldsData.find(
      field => field?.extraValue === 'riskAssessmentVisitors'
    )?.value || [];

  const newVisitorIds =
    (newData?.customFieldsData || []).find(
      field => field?.extraValue === 'riskAssessmentVisitors'
    )?.value || [];

  const removedVistorIds = oldVisitorIds.filter(
    oldVisitorId => !newVisitorIds.includes(oldVisitorId)
  );
  const addedVisitorIds = newVisitorIds.filter(
    newVisitorId => !oldVisitorIds.includes(newVisitorId)
  );

  await sendCardsMessage({
    subdomain,
    action: 'sendNotifications',
    data: {
      item: object,
      user,
      type: `${contentType}Add`,
      action: `invited you as visitor`,
      content: `'${object.name}'.`,
      contentType,
      invitedUsers: addedVisitorIds,
      removedUsers: removedVistorIds
    },
    isRPC: true
  });
};

const handleConfig = async ({ models, subdomain, params }) => {
  const { type, object } = params;
  const { customFieldsData, stageId, _id, branchIds, departmentIds } =
    object || {};
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

  const addedRiskAssessment: any[] = [];
  const conformity = {
    cardId: _id,
    cardType: type.replace('cards:', '')
  } as any;

  if (!!branchIds?.length) {
    conformity.branchId = branchIds[0];
  }

  if (!!departmentIds?.length) {
    conformity.branchId = departmentIds[0];
  }

  for (const data of customFieldsData) {
    const config = await models.RiskAssessmentsConfigs.findOne({
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
        if (!!customField?.indicatorIds?.length) {
          for (const indicatorId of customField.indicatorIds) {
            const addedConformity = await models.RiskAssessments.addRiskAssessment(
              {
                ...conformity,
                indicatorId: indicatorId || undefined
              }
            );
            addedRiskAssessment.push(addedConformity);
          }
        } else {
          const addedConformity = await models.RiskAssessments.addRiskAssessment(
            {
              ...conformity,
              indicatorId: customField.indicatorId,
              groupId: customField.groupId
            }
          );
          addedRiskAssessment.push(addedConformity);
        }
      }
    }
  }

  if (!addedRiskAssessment.length) {
    const filter = { ...commonFilter, customFieldId: null, configs: [] };

    const config = await models.RiskAssessmentsConfigs.findOne({
      $or: [
        { ...filter, stageId },
        { ...filter, stageId: '' }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!!config?.indicatorIds?.length) {
      for (const indicatorId of config?.indicatorIds) {
        await models.RiskAssessments.addRiskAssessment({
          ...conformity,
          indicatorId: indicatorId || undefined
        });
      }
    }

    if (config?.indicatorId || config?.groupId) {
      await models.RiskAssessments.addRiskAssessment({
        ...conformity,
        indicatorId: config?.indicatorId || undefined,
        groupId: config?.groupId || undefined
      });
    }
  }
};

const handleRemoveCard = () => {};
