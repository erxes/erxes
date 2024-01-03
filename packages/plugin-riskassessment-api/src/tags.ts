import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Risk Assessments',
      type: 'riskassessment'
    }
  ],
  tag: async ({ subdomain, data }) => {
    const { action, _ids, targetIds, tagIds } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      const indicatorsCount = await models.RiskIndicators.countDocuments({
        tagIds: { $in: _ids }
      });
      const groupsCount = await models.IndicatorsGroups.countDocuments({
        tagIds: { $in: _ids }
      });

      response = indicatorsCount + groupsCount;
    }

    if (action === 'tagObject') {
      await models.IndicatorsGroups.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );
      await models.RiskIndicators.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      const indicators = await models.RiskIndicators.find({
        _id: { $in: targetIds }
      }).lean();
      const groups = await models.IndicatorsGroups.find({
        _id: { $in: targetIds }
      }).lean();

      response = [...indicators, ...groups];
    }

    return response;
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, action }
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.RiskIndicators.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
      await models.IndicatorsGroups.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const indicatorIds = await models.RiskIndicators.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');
      const groupIds = await models.IndicatorsGroups.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      await models.RiskIndicators.updateMany(
        {
          _id: { $in: indicatorIds }
        },
        {
          $set: { 'tagIds.$[elem]': destId }
        },
        {
          arrayFilters: [{ elem: { $eq: sourceId } }]
        }
      );
      await models.IndicatorsGroups.updateMany(
        {
          _id: { $in: groupIds }
        },
        {
          $set: { 'tagIds.$[elem]': destId }
        },
        {
          arrayFilters: [{ elem: { $eq: sourceId } }]
        }
      );
    }
  }
};
