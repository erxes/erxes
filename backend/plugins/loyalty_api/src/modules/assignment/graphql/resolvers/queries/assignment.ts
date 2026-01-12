import { IAssignmentListParams } from '@/assignment/@types/assignment';
import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: IAssignmentListParams) => {
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
  subdomain: string,
  fieldId: string,
  segments: any,
  customerId: string,
) => {
  const customer = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: { _id: customerId },
    defaultValue: null,
  });

  for (const { _id, conditions } of segments || []) {
    for (const {
      propertyName,
      propertyValue,
      propertyOperator,
    } of conditions || []) {
      if (propertyName.includes(fieldId) && propertyOperator === 'numbere') {
        const { customFieldsData = [] } = customer || {};

        const customFieldData = customFieldsData.find(
          (customFieldData) => customFieldData?.field === fieldId,
        );

        const segment = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'segment',
          action: 'findOne',
          input: {
            'conditions.subSegmentId': _id,
          },
          defaultValue: null,
        });

        return {
          checkValue: Number(propertyValue) || 0,
          segmentId: segment?._id,
          currentValue: Number(customFieldData?.value) || 0,
        };
      }
    }
  }

  return null;
};

export const assignmentQueries = {
  async getAssignments(
    _root: undefined,
    params: IAssignmentListParams,
    { models }: IContext,
  ) {
    const filter: any = generateFilter(params);

    return cursorPaginate({
      model: models.Assignment,
      params,
      query: filter,
    });
  },

  async checkAssignment(
    _root: undefined,
    params: { customerId: string; _ids?: string[] },
    { models, subdomain, user }: IContext,
  ) {
    const { _ids, customerId } = params;
    const now = new Date();

    const filter: any = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (_ids) {
      filter._id = { $in: _ids };
    }

    const assignmentCampaigns = await models.Campaign.find(filter).lean();

    if (!assignmentCampaigns.length) {
      return { status: 'checked' };
    }

    const assignments = await models.Assignment.find({
      ownerId: customerId,
      campaignId: { $in: assignmentCampaigns.map((ac) => ac._id) },
    });

    let positiveSegments: { segmentId: string; isIn: boolean }[] = [];
    let negativeSegments: { segmentId: string; isIn: boolean }[] = [];

    for (const assignmentCampaign of assignmentCampaigns) {
      const { _id, conditions } = assignmentCampaign;

      if (
        !conditions?.allowMultiWin &&
        assignments.some(
          (a) => a.campaignId.toString() === _id.toString(),
        )
      ) {
        continue;
      }

      if (!conditions?.segmentIds) {
        continue;
      }

      const segmentIds = conditions.segmentIds;

      for (const segmentId of segmentIds) {
        const isIn = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'segment',
          action: 'isInSegment',
          input: { segmentId, idToCheck: customerId },
          defaultValue: false,
        });

        if (isIn) {
          positiveSegments.push({ segmentId, isIn: true });
        } else {
          negativeSegments.push({ segmentId, isIn: false });
        }
      }

      if (conditions.fieldId) {
        const subSegments = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'segment',
          action: 'findSubSegments',
          input: { segmentIds },
          defaultValue: [],
        });

        const result = await generateFieldMaxValue(
          subdomain,
          conditions.fieldId,
          subSegments,
          customerId,
        );

        if (!result) {
          continue;
        }

        const { checkValue, currentValue, segmentId } = result;

        if (currentValue < checkValue) {
          continue;
        }

        positiveSegments = positiveSegments.map((segment) =>
          segment.segmentId === segmentId
            ? { ...segment, isIn: true }
            : segment,
        );

        if (!positiveSegments.every((segment) => segment.isIn)) {
          continue;
        }

        const count = Math.floor(currentValue / checkValue);

        for (let i = 0; i < count; i++) {
          try {
            await models.Assignment.awardAssignment(
              _id.toString(),
              customerId,
              user,
            );
          } catch (error) {
            throw new Error(error.message);
          }
        }

        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'updateOne',
          input: {
            selector: {
              _id: customerId,
              'customFieldsData.field': conditions.fieldId,
            },
            modifier: {
              $set: {
                'customFieldsData.$.value':
                  currentValue - checkValue * count,
              },
            },
          },
        });
      } else if (positiveSegments.every((segment) => segment.isIn)) {
        try {
          await models.Assignment.awardAssignment(
            _id.toString(),
            customerId,
            user,
          );
        } catch (error) {
          throw new Error(error.message);
        }
      }
    }

    return {
      status: 'checked',
      positive: positiveSegments,
      negative: negativeSegments,
    };
  },
};
