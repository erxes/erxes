import { ApprovalRequest } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

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
      _context: IContext,
    ) {
      return {
        contentType,
        contentId,
        label: contentType,
      };
    },
  },
};
