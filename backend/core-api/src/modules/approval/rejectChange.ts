import {
  ApprovalRequest,
  approvalChangePluginName,
  TApprovalChangeProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

/**
 * Tells the plugin that owns a change request's type that the change will not
 * happen. Best effort: the request is already rejected or cancelled, and a
 * plugin with no rejecter for the type simply does nothing.
 */
export const notifyRejectedChange = async (
  subdomain: string,
  request: ApprovalRequest,
  { rejecterId, reason }: { rejecterId?: string; reason?: string },
) => {
  const { change } = request;
  const pluginName = change ? approvalChangePluginName(change.changeType) : '';

  if (!change || !pluginName) {
    return;
  }

  try {
    await sendCoreModuleProducer({
      subdomain,
      moduleName: 'approval',
      pluginName,
      producerName: TApprovalChangeProducers.REJECT,
      input: {
        requestId: request._id,
        changeType: change.changeType,
        payload: change.payload,
        contentType: request.contentType,
        contentId: request.contentId,
        requesterId: request.requesterId,
        ...(rejecterId ? { rejecterId } : {}),
        ...(reason ? { reason } : {}),
      },
    });
  } catch (error) {
    console.error(
      `Rejecting change ${change.changeType} of request ${request._id} failed:`,
      error instanceof Error ? error.message : error,
    );
  }
};
