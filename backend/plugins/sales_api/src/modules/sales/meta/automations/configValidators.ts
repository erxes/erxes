import {
  readLiteralConfigId,
  TAutomationConfigValidator,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';

/** The stage a deal starts in exists. */
export const validateDealCreateConfig: TAutomationConfigValidator = async ({
  subdomain,
  config,
}) => {
  const stageId = readLiteralConfigId(config.stageId);

  if (!stageId) {
    return [];
  }

  const models = await generateModels(subdomain);

  return (await models.Stages.exists({ _id: stageId }))
    ? []
    : [
        {
          path: 'config.stageId',
          malformed: true,
          message: `Stage "${stageId}" does not exist`,
        },
      ];
};
