import { ApprovalLockState } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import {
  DOCUMENT_APPROVAL_CONTENT_TYPE,
  IDocumentDocument,
} from '~/modules/documents/types';

export default {
  async __resolveReference(
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('documentsRead');
    return models.Documents.getDocument({ _id, user });
  },

  approvalLockState(
    document: IDocumentDocument & { approvalLockState?: ApprovalLockState },
    _args: undefined,
    { models, user }: IContext,
  ): ApprovalLockState | Promise<ApprovalLockState> {
    return (
      document.approvalLockState ||
      models.ApprovalLocks.getState({
        user,
        contentType: DOCUMENT_APPROVAL_CONTENT_TYPE,
        contentId: document._id,
        ownerId: document.createdUserId,
        action: 'view',
      })
    );
  },

  async createdUser(
    document: IDocumentDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Users.findOne({ _id: document.createdUserId });
  },
};
