import { generateModels } from './connectionResolver';
import { sendCardsMessage } from './messageBroker';
import { PLAN_STATUSES } from './common/constants';
import * as moment from 'moment';

const handleDailyJob = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const NOW = new Date();
  const tommorrow = moment().add(1, 'days');
  console.log(`starting daily job of risk assessment schedule at ${NOW}`);

  const plans = await models.Plans.find({
    createDate: {
      $gte: new Date(tommorrow.startOf('day').toISOString()),
      $lte: new Date(tommorrow.endOf('day').toISOString())
    },
    status: 'active'
  });

  if (!plans?.length) {
    console.log(
      `As of ${NOW}, no plans at ${new Date(tommorrow.format('YYYY-MM-DD'))}`
    );
  }

  for (const plan of plans) {
    const schedules = await models.Schedules.find({
      planId: plan._id
    });

    if (!schedules?.length) {
      console.log(
        `Not found schedules in risk assessment plan named ${plan.name} at: ${NOW}`
      );
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
        customFieldsData: schedule.customFieldsData
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

    console.log(
      `created: ${newItemIds.length} items from audit plan named:${plan.name}`
    );

    try {
      await models.Plans.updateOne(
        { _id: plan._id },
        { status: PLAN_STATUSES.ARCHIVED, cardIds: newItemIds }
      );
      console.log(`plan work done successfully`);
    } catch (error) {
      console.log(error.message);
    }
  }
  console.log(`${plans.length} plans worked successfully`);
  return 'done';
};

export default {
  handleDailyJob
};
