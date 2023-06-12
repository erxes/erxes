import { generateModels } from './connectionResolver';
import { sendCardsMessage, sendCoreMessage } from './messageBroker';

const handleDailyJob = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const NOW = new Date();
  console.log(`starting daily job of risk assessment schedule at ${NOW}`);

  const schedule = await models.Schedules.findOne({
    date: {
      $gte: NOW.setHours(0, 0, 0, 0),
      $lte: NOW.setHours(23, 59, 59, 999)
    }
  });

  if (!schedule) {
    console.log(`not found daily job of risk assessment schedule`);
    return;
  }

  const plan = await models.Plans.findOne({ _id: schedule.planId });

  if (!plan) {
    console.log(
      `something went wrong when trying to find plan with id ${schedule.planId}`
    );
    return;
  }

  const { configs, plannerId, structureType, structureTypeIds } = plan;

  const planner = await sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: {
      _id: plannerId
    },
    isRPC: true,
    defaultValue: null
  });

  console.log('send request to cards create item');

  const newItem = await sendCardsMessage({
    subdomain,
    action: `${configs.cardType}.create`,
    data: { name: schedule.name },
    isRPC: true,
    defaultValue: null
  });

  if (!newItem) {
    console.log(
      'something went wrong when sending request to cards create item'
    );
    return;
  }

  console.log('created card successfully');
  const payload = {
    user: planner,
    itemId: newItem._id,
    type: configs.cardType,
    stageId: configs.stageId,
    assignedUserIds: schedule.assignedUserIds,
    startDate: schedule.date,
    customeFieldsData: schedule.customeFieldsData,
    processId: Math.random()
  };
  if (['branch', 'department'].includes(structureType)) {
    const fieldName = structureType;
    payload[`${fieldName}Ids`] = structureTypeIds || [];
  }

  const item = await sendCardsMessage({
    subdomain,
    action: 'editItem',
    data: payload,
    isRPC: true,
    defaultValue: null
  });

  console.log('starting create risk assessment in cards');

  const RAPayload = {
    cardType: configs.cardType,
    cardId: item._id,
    bulkItems: [
      {
        [`${structureType}Ids`]: structureTypeIds,
        groupId: schedule.groupId,
        indicatorId: schedule.indicatorId
      }
    ]
  };

  await models.RiskAssessments.addBulkRiskAssessment(RAPayload).catch(err => {
    console.log(err.message);
  });

  console.log('connected risk assessment in cards successfully ');
  return 'done';
};

export default {
  handleDailyJob
};
