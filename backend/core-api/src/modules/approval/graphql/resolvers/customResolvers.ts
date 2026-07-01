import { ApprovalRequest } from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { resolveApprovalContent } from '../../utils/resolveApprovalContent';

export const approvalCustomResolvers = {
  ApprovalRequest: {
    async requester(
      { requesterId }: ApprovalRequest,
      _args: unknown,
      { models }: IContext,
    ) {
      return models.Users.findOne({ _id: requesterId });
    },

    async requiredApprovers(
      { requiredApproverIds }: ApprovalRequest,
      _args: unknown,
      { models }: IContext,
    ) {
      return models.Users.find({ _id: { $in: requiredApproverIds || [] } });
    },

    async content(
      { contentType, contentId }: ApprovalRequest,
      _args: unknown,
      { models }: IContext,
    ) {
      try {
        return await resolveApprovalContent({
          models,
          contentType,
          contentId,
        });
      } catch (error) {
        if (!(error instanceof ExpectedError) || error.code !== 'NOT_FOUND') {
          throw error;
        }

        return {
          contentType,
          contentId,
          label: contentType,
        };
      }
    },
  },
};
