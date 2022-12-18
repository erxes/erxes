import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';
import { AssignmentCheckResponse, isInSegment } from '../../../utils';
import { IAssignment } from '../../../models/definitions/assignments';

const generateFilter = (params: ICommonParams) => {
  const filter: any = {};

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

const assignmentQueries = {
  assignments(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Assignments.find(filter), params);
  },

  async assignmentsMain(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Assignments.find(filter), params);

    const totalCount = await models.Assignments.find(filter).countDocuments();

    return {
      list,
      totalCount
    };
  },
  async checkAssignment(
    _root,
    params: { customerId: string; _id: string },
    { models, subdomain }: IContext
  ) {
    const { _id, customerId } = params;

    const assignment = await models.Assignments.findOne({ _id });

    let positiveSegments: AssignmentCheckResponse[] = [];
    let negativeSegments: AssignmentCheckResponse[] = [];

    if (assignment) {
      const assignmentCampaign = await models.AssignmentCampaigns.getAssignmentCampaign(
        assignment.campaignId
      );

      if (!assignmentCampaign) {
        throw new Error('Assignment Campaign not found.');
      }

      if (assignment.segmentIds && assignmentCampaign.segmentIds) {
        const segmentIds = assignment.segmentIds;
        const campaignSegmentIds = assignmentCampaign.segmentIds;

        // for (const campaignSegmentId of campaignSegmentIds) {
        //   for (const segmentId of segmentIds) {
        //     const isIn = await isInSegment(subdomain, campaignSegmentId , segmentId);

        //     if (isIn) {
        //       positiveSegments.push({ segmentId: segmentId, isIn: true });
        //     } else {
        //       negativeSegments.push({ segmentId: segmentId, isIn: false });
        //     }

        //   }
        // }
        for (const segmentId of segmentIds) {
          const isIn = await isInSegment(subdomain, segmentId, customerId);

          if (isIn) {
            positiveSegments.push({ segmentId: segmentId, isIn: true });
          } else {
            negativeSegments.push({ segmentId: segmentId, isIn: false });
          }
        }

        if (positiveSegments.every(segment => segment.isIn)) {
          const voucher = await models.Vouchers.createVoucher({
            campaignId: assignmentCampaign.voucherCampaignId,
            ownerId: customerId,
            ownerType: 'customer',
            status: 'new'
          });
        }
      } else {
        throw new Error('Segment IDs not found.');
      }
    } else {
      throw new Error('Assignment not found.');
    }

    return {
      positive: positiveSegments,
      negative: negativeSegments
    };
  }
};

checkPermission(assignmentQueries, 'assignmentsMain', 'showLoyalties', {
  list: [],
  totalCount: 0
});

export default assignmentQueries;
