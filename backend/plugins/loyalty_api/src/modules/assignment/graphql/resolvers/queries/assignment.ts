import {
  IAssignmentCheckResponse,
  IAssignmentDocument,
  IAssignmentParams,
} from '@/assignment/@types/assignment';
import { IAssignmentCampaignDocument } from '@/assignment/@types/assignmentCampaign';
import { generateFieldMaxValue } from '@/assignment/utils';
import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: IAssignmentParams) => {
  const filter: FilterQuery<IAssignmentDocument> = {};

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const assignmentQueries = {
  async assignments(
    _root: undefined,
    params: IAssignmentParams,
    { models }: IContext,
  ) {
    const filter: FilterQuery<IAssignmentDocument> = generateFilter(params);

    return cursorPaginate({
      model: models.Assignments,
      params,
      query: filter,
    });
  },

  async assignmentDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Assignments.getAssignment(_id);
  },

  async checkAssignment(
    _root: undefined,
    params: { customerId: string; _ids?: string[] },
    { models, subdomain }: IContext,
  ) {
    const { _ids, customerId } = params;

    const now = new Date();

    const filter: FilterQuery<IAssignmentCampaignDocument> = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (_ids) {
      filter._id = { $in: _ids };
    }

    const assignmentCampaigns = await models.AssignmentCampaigns.find(
      filter,
    ).lean();

    const assignments = await models.Assignments.find({
      ownerId: customerId,
      campaignId: { $in: assignmentCampaigns.map((ac) => ac._id) },
    });

    let positiveSegments: IAssignmentCheckResponse[] = [];
    let negativeSegments: IAssignmentCheckResponse[] = [];

    if (!assignmentCampaigns.length) {
      return { status: 'checked' };
    }

    for (const assignmentCampaign of assignmentCampaigns) {
      if (
        !assignmentCampaign?.allowMultiWin &&
        (assignments.map((a) => a.campaignId) || []).includes(
          assignmentCampaign._id,
        )
      ) {
        continue;
      }

      if (assignmentCampaign.segmentIds) {
        const segmentIds = assignmentCampaign.segmentIds;

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
            positiveSegments.push({ segmentId: segmentId, isIn: true });
          } else {
            negativeSegments.push({ segmentId: segmentId, isIn: false });
          }
        }

        if (assignmentCampaign?.fieldId) {
          const subSegments = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'segment',
            action: 'findSubSegments',
            input: { segmentIds },
            defaultValue: [],
          });

          const {
            checkValue = 0,
            currentValue = 0,
            segmentId,
          } = (await generateFieldMaxValue(
            subdomain,
            assignmentCampaign.fieldId,
            subSegments,
            customerId,
          )) || {};

          if (currentValue >= checkValue) {
            positiveSegments = positiveSegments.map((positiveSegment) =>
              positiveSegment.segmentId === segmentId
                ? { ...positiveSegment, isIn: true }
                : positiveSegment,
            );

            const count = Math.floor(currentValue / checkValue);

            if (positiveSegments.every((segment) => segment.isIn)) {
              for (let i = 1; i <= count; i++) {
                try {
                  await models.AssignmentCampaigns.awardAssignmentCampaign(
                    assignmentCampaign._id,
                    customerId,
                  );

                  await sendTRPCMessage({
                    subdomain,
                    pluginName: 'core',
                    method: 'mutation',
                    module: 'customers',
                    action: 'updateOne',
                    input: {
                      selector: {
                        _id: customerId,
                        'customFieldsData.field': assignmentCampaign.fieldId,
                      },
                      modifier: {
                        $set: {
                          'customFieldsData.$.value':
                            currentValue - checkValue * count,
                        },
                      },
                    },
                  });
                } catch (error) {
                  throw new Error(error.message);
                }
              }
            }
          }
        } else if (positiveSegments.every((segment) => segment.isIn)) {
          try {
            await models.AssignmentCampaigns.awardAssignmentCampaign(
              assignmentCampaign._id,
              customerId,
            );
          } catch (error) {
            throw new Error(error.message);
          }
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
