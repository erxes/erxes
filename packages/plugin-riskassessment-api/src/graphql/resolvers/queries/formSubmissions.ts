import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { getIndicatorSubmissions } from '../../../utils';

const formSubmissionQueries = {
  async indicatorsAssessmentHistory(
    _root,
    { indicatorId }: { indicatorId: string },
    { models, subdomain }: IContext
  ) {
    const indicatorAssessments = await models.RiskAssessmentIndicators.find({
      status: { $ne: 'In Progress' },
      indicatorId
    })
      .sort({ closedAt: -1 })
      .limit(5)
      .lean();

    for (const indicatorAssessment of indicatorAssessments) {
      indicatorAssessment.submissions = await getIndicatorSubmissions({
        models,
        subdomain,
        assessmentId: indicatorAssessment.assessmentId,
        indicatorId: indicatorAssessment.indicatorId
      });
    }

    return indicatorAssessments;
  }
};

checkPermission(
  formSubmissionQueries,
  'indicatorsAssessmentHistory',
  'showRiskAssessment'
);

export default formSubmissionQueries;
