import {
  APPROVAL_REQUEST_STATUSES,
  ApprovalRequest,
  approvalChangePluginName,
  TApprovalChangeProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * Carries out the change an approved request was holding. The plugin that owns
 * the change type does the work over its own `approval` endpoint, so approval
 * never learns what any module does. A decision nobody acted on is not an
 * approval, so a failure is written onto the request rather than swallowed,
 * and `appliedAt` keeps a repeated approval from doing the work twice.
 */
export const applyApprovedChange = async (
  models: IModels,
  subdomain: string,
  request: ApprovalRequest,
  approverId: string,
): Promise<ApprovalRequest> => {
  const { change } = request;

  if (!change || request.appliedAt) {
    return request;
  }

  const fail = async (message: string) =>
    (await models.ApprovalRequests.findOneAndUpdate(
      { _id: request._id },
      {
        $set: {
          status: APPROVAL_REQUEST_STATUSES.APPLY_FAILED,
          applyError: message,
        },
      },
      { new: true },
    ).lean<ApprovalRequest>()) || request;

  const pluginName = approvalChangePluginName(change.changeType);

  if (!pluginName) {
    return fail(`"${change.changeType}" names no plugin to apply it`);
  }

  try {
    // A disabled or unreachable plugin makes the producer return quietly, so
    // only the applier's own acknowledgement counts as the work being done.
    const result = await sendCoreModuleProducer({
      subdomain,
      moduleName: 'approval',
      pluginName,
      producerName: TApprovalChangeProducers.APPLY,
      input: {
        requestId: request._id,
        changeType: change.changeType,
        payload: change.payload,
        contentType: request.contentType,
        contentId: request.contentId,
        requesterId: request.requesterId,
        approverId,
      },
    });

    if (!result?.applied) {
      return fail(`${pluginName} did not apply "${change.changeType}"`);
    }
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }

  return (
    (await models.ApprovalRequests.findOneAndUpdate(
      { _id: request._id },
      { $set: { appliedAt: new Date() }, $unset: { applyError: '' } },
      { new: true },
    ).lean<ApprovalRequest>()) || request
  );
};
