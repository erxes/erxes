import {
  readLiteralConfigId,
  TAutomationConfigIssue,
  TAutomationConfigValidator,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';

/** The channel, pipeline and status a ticket is created in exist and belong together. */
export const validateTicketCreateConfig: TAutomationConfigValidator = async ({
  subdomain,
  config,
}) => {
  const channelId = readLiteralConfigId(config.channelId);
  const pipelineId = readLiteralConfigId(config.pipelineId);
  const statusId = readLiteralConfigId(config.statusId);
  const models = await generateModels(subdomain);
  const issues: TAutomationConfigIssue[] = [];

  if (channelId && !(await models.Channels.exists({ _id: channelId }))) {
    issues.push({
      path: 'config.channelId',
      malformed: true,
      message: `Channel "${channelId}" does not exist`,
    });
  }

  const pipeline = pipelineId
    ? await models.Pipeline.findOne(
        { _id: pipelineId },
        { channelId: 1 },
      ).lean()
    : null;

  if (pipelineId && !pipeline) {
    issues.push({
      path: 'config.pipelineId',
      malformed: true,
      message: `Pipeline "${pipelineId}" does not exist`,
    });
  } else if (pipeline && channelId && pipeline.channelId !== channelId) {
    issues.push({
      path: 'config.pipelineId',
      malformed: true,
      message: `Pipeline "${pipelineId}" belongs to another channel`,
    });
  }

  const status = statusId
    ? await models.Status.findOne({ _id: statusId }, { pipelineId: 1 }).lean()
    : null;

  if (statusId && !status) {
    issues.push({
      path: 'config.statusId',
      malformed: true,
      message: `Status "${statusId}" does not exist`,
    });
  } else if (status && pipelineId && status.pipelineId !== pipelineId) {
    issues.push({
      path: 'config.statusId',
      malformed: true,
      message: `Status "${statusId}" belongs to another pipeline`,
    });
  }

  return issues;
};
