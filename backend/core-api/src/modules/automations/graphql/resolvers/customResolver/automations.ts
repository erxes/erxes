import {
  ApprovalLockState,
  IAutomationDoc,
} from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IAutomationEmailTemplateDocument } from 'erxes-api-shared/core-types';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '../../../constants';

export default {
  async createdUser(
    { createdBy }: IAutomationDoc,
    _args: unknown,
    { models }: IContext,
  ) {
    return await models.Users.findOne({ _id: createdBy });
  },

  async updatedUser(
    { updatedBy }: IAutomationDoc,
    _args: unknown,
    { models }: IContext,
  ) {
    return await models.Users.findOne({ _id: updatedBy });
  },

  async tags({ tagIds }: IAutomationDoc, _args: unknown, { models }: IContext) {
    return await models.Tags.find({ _id: { $in: tagIds } });
  },

  async approvalLockState(
    automation: IAutomationDoc & {
      _id: string;
      approvalLockState?: ApprovalLockState;
    },
    { action }: { action?: string },
    { models, user }: IContext,
  ) {
    if (automation.approvalLockState) {
      return automation.approvalLockState;
    }

    return models.ApprovalLocks.getState({
      user,
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
      contentId: automation._id,
      ownerId: automation.createdBy,
      action: action || 'view',
    });
  },
};

export const automationEmailTemplateResolvers = {
  async createdUser(
    { createdBy }: IAutomationEmailTemplateDocument,
    _args: unknown,
    { models }: IContext,
  ) {
    return await models.Users.findOne({ _id: createdBy });
  },
};
