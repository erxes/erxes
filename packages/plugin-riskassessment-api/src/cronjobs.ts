import { generateModels } from './connectionResolver';
import { sendCardsMessage } from './messageBroker';
import { PLAN_STATUSES } from './common/constants';

const handleDailyJob = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const NOW = new Date();
  console.log(`starting daily job of risk assessment schedule at ${NOW}`);

  const plan = await models.Plans.findOne({
    createDate: {
      $gte: NOW.setHours(0, 0, 0, 0),
      $lte: NOW.setHours(23, 59, 59, 999)
    },
    status: 'active'
  });

  if (!plan) {
    console.log(`not found plan of risk assessment at:${NOW}`);
    return;
  }

  const schedules = await models.Schedules.find({
    planId: plan._id
  });

  if (!schedules?.length) {
    console.log(`Not found schedules in risk assessment plan at: ${NOW}`);
    return;
  }

  const commonDoc = {
    startDate: plan.startDate,
    closeDate: plan.closeDate
  };

  const { configs, plannerId, structureType } = plan;

  let newItemIds: string[] = [];

  for (const schedule of schedules) {
    const payload = {
      ...commonDoc,
      name: schedule.name,
      userId: plannerId,
      stageId: configs.stageId,
      assignedUserIds: schedule.assignedUserIds,
      customeFieldsData: schedule.customeFieldsData
    };
    const fieldName = structureType;
    if (['branch', 'department'].includes(structureType)) {
      payload[`${fieldName}Ids`] = schedule.structureTypeId
        ? [schedule.structureTypeId]
        : [];
    }

    const newItem = await sendCardsMessage({
      subdomain,
      action: `${configs.cardType}s.create`,
      data: payload,
      isRPC: true,
      defaultValue: null
    }).catch(err => {
      console.log(err.message);
    });

    await models.RiskAssessments.addRiskAssessment({
      cardType: configs.cardType,
      cardId: newItem._id,
      indicatorId: schedule.indicatorId,
      [`${fieldName}Id`]: schedule.structureTypeId || ''
    }).catch(err => console.log(err.message));

    newItemIds = [...newItemIds, newItem._id];
  }

  await models.Plans.updateOne(
    { _id: plan._id },
    { status: PLAN_STATUSES.ARCHIVED, cardIds: newItemIds }
  );

  return 'done';
};

export default {
  handleDailyJob
};
