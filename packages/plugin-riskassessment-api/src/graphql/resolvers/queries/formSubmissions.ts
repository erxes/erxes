import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { getIndicatorSubmissions } from '../../../utils';
import * as _lodash from 'lodash';

const formSubmissionQueries = {
  async indicatorsAssessmentHistory(
    _root,
    {
      indicatorId,
      branchId,
      departmentId,
      operationId
    }: {
      indicatorId: string;
      branchId: string;
      operationId: string;
      departmentId: string;
    },
    { models, subdomain }: IContext
  ) {
    let filters: any = { status: { $ne: 'In Progress' }, indicatorId };

    let assessmentFilters: any = { branchId, departmentId, operationId };
    if (!_lodash.isEmpty(assessmentFilters)) {
      assessmentFilters = Object.fromEntries(
        Object.entries(assessmentFilters).filter(([key, value]) => value)
      );

      const assessmentIds = await models.RiskAssessments.find(
        assessmentFilters
      ).distinct('_id');

      filters.assessmentId = { $in: assessmentIds };
    }

    const indicatorAssessments = await models.RiskAssessmentIndicators.find(
      filters
    )
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
