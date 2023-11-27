import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';
import { AssignmentCheckResponse, isInSegment } from '../../../utils';
import {
  sendContactsMessage,
  sendSegmentsMessage
} from '../../../messageBroker';

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

const generateFieldMaxValue = async (
  subdomain,
  fieldId,
  segments,
  customerId
) => {
  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: { _id: customerId },
    isRPC: true,
    defaultValue: null
  });

  //get property value and value to check from sub segments
  for (const { _id, conditions } of segments || []) {
    for (const {
      propertyName,
      propertyValue,
      propertyOperator
    } of conditions || []) {
      if (propertyName.includes(fieldId) && propertyOperator === 'numbere') {
        const { customFieldsData = [] } = customer || {};

        const customFieldData = customFieldsData.find(
          customFieldData => customFieldData?.field === fieldId
        );

        return {
          checkValue: propertyValue,
          segmentId: _id,
          currentValue: customFieldData.value
        };
      }
    }
  }
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
        !assignmentCampaign?.allowMultiWin &&
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

        if (assignmentCampaign?.fieldId) {
          const subSegments = await sendSegmentsMessage({
            subdomain,
            action: 'findSubSegments',
            data: { segmentIds },
            isRPC: true,
            defaultValue: []
          });

          let { checkValue, currentValue, segmentId } =
            (await generateFieldMaxValue(
              subdomain,
              assignmentCampaign.fieldId,
              subSegments,
              customerId
            )) || {};

          if (currentValue >= checkValue) {
            positiveSegments = positiveSegments.filter(
              positiveSegment => positiveSegment.segmentId !== segmentId
            );

            const count = Math.ceil(currentValue / checkValue) - 1;

            if (positiveSegments.every(segment => segment.isIn)) {
              for (let i = 1; i <= count; i++) {
                try {
                  await models.AssignmentCampaigns.awardAssignmentCampaign(
                    assignmentCampaign._id,
                    customerId
                  );

                  await sendContactsMessage({
                    subdomain,
                    action: 'customers.updateOne',
                    data: {
                      selector: {
                        _id: customerId,
                        'customFieldsData.field': assignmentCampaign.fieldId
                      },
                      modifier: {
                        $set: {
                          'customFieldsData.$.value':
                            currentValue - checkValue * count
                        }
                      }
                    },
                    isRPC: true
                  });
                } catch (error) {
                  throw new Error(error.message);
                }
              }
            }

            positiveSegments = positiveSegments.map(positiveSegment =>
              positiveSegment.segmentId === segmentId
                ? { ...positiveSegment, isIn: true }
                : positiveSegment
            );
          }
        } else {
          if (positiveSegments.every(segment => segment.isIn)) {
            try {
              await models.AssignmentCampaigns.awardAssignmentCampaign(
                assignmentCampaign._id,
                customerId
              );
            } catch (error) {
              throw new Error(error.message);
            }
          }
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
