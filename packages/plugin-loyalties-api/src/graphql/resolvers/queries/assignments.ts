import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';
import { AssignmentCheckResponse, isInSegment } from '../../../utils';

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
    params: { customerId: string; _ids?: string[] },
    { models, subdomain }: IContext
  ) {
    const { _ids, customerId } = params;

    const now = new Date();

    const filter: any = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    if (_ids) {
      filter._id = { $in: _ids };
    }

    const assignmentCampaigns = await models.AssignmentCampaigns.find(
      filter
    ).lean();

    const assignments = await models.Assignments.find({
      ownerId: customerId,
      campaignId: { $in: assignmentCampaigns.map(ac => ac._id) }
    });

    let positiveSegments: AssignmentCheckResponse[] = [];
    let negativeSegments: AssignmentCheckResponse[] = [];

    if (!assignmentCampaigns.length) {
      return { status: 'checked' };
    }

    for (const assignmentCampaign of assignmentCampaigns) {
      if (
        (assignments.map(a => a.campaignId) || []).includes(
          assignmentCampaign._id
        )
      ) {
        continue;
      }

      if (assignmentCampaign.segmentIds) {
        const segmentIds = assignmentCampaign.segmentIds;

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

          await models.Assignments.createAssignment({
            campaignId: assignmentCampaign._id,
            ownerType: 'customer',
            ownerId: customerId,
            status: 'new',
            voucherId: voucher._id,
            voucherCampaignId: assignmentCampaign.voucherCampaignId
          });
        }
      }
    }
    return {
      status: 'checked',
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
