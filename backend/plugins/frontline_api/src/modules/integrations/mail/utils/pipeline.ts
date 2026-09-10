import { IModels } from '~/connectionResolvers';
import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import { MAIL_HEALTH_STATUSES } from '@/integrations/mail/constants';
import { buildMailAddress } from '@/integrations/mail/utils/allocate';
import { ensureMailIndexes } from '@/integrations/mail/utils/indexes';
import {
  normalizeForwardFrom,
  normalizeSenderName,
} from '@/integrations/mail/utils/settings';
import { assertSendableIntegration } from '@/integrations/mail/utils/transports/readiness';

export interface IPipelineMailSettings {
  senderName?: string;
  forwardFrom?: string;
}

export interface IPipelineMailConnectInput extends IPipelineMailSettings {
  models: IModels;
  subdomain: string;
  pipelineId: string;
}

/**
 * A disconnected address keeps its row so the address, and the thread scope
 * keyed on that row's id, survive a reconnect. Every reader wants the connected
 * one; `disabledAt: null` also matches rows written before the field existed.
 */
export const findPipelineIntegration = async (
  models: IModels,
  pipelineId?: string,
) =>
  pipelineId
    ? models.MailIntegrations.findOne({ pipelineId, disabledAt: null })
    : null;

const findDisconnectedPipelineMail = (models: IModels, pipelineId: string) =>
  models.MailIntegrations.findOne({
    pipelineId,
    disabledAt: { $ne: null },
  });

const getPipeline = async (models: IModels, pipelineId: string) => {
  const pipeline = await models.Pipeline.findOne({ _id: pipelineId }).lean();

  if (!pipeline) {
    throw new Error('Ticket pipeline not found');
  }

  return pipeline;
};

const releaseAddress = async (models: IModels, address: string) => {
  const holder = await models.MailIntegrations.findOne({ address });

  if (!holder) {
    return;
  }

  if (!holder.pipelineId) {
    throw new Error(
      `${address} already belongs to a channel inbox — rename this pipeline to take a different address`,
    );
  }

  const pipeline = await models.Pipeline.findOne({
    _id: holder.pipelineId,
  }).lean();

  if (pipeline) {
    throw new Error(
      `${address} already belongs to the ${pipeline.name} pipeline — rename this pipeline to take a different address`,
    );
  }

  await models.MailIntegrations.deleteOne({ _id: holder._id });
};

const forwardSetupFields = (forwardFrom: string) =>
  forwardFrom
    ? { forwardFrom, forwardPendingAt: new Date(), forwardVerification: null }
    : { forwardFrom: '', forwardPendingAt: null, forwardVerification: null };

export const connectPipelineMail = async ({
  models,
  subdomain,
  pipelineId,
  senderName,
  forwardFrom,
}: IPipelineMailConnectInput): Promise<IMailIntegrationDocument> => {
  const pipeline = await getPipeline(models, pipelineId);

  await ensureMailIndexes(models, subdomain);

  const connected = await findPipelineIntegration(models, pipelineId);

  if (connected) {
    throw new Error(
      `This pipeline already writes mail from ${connected.address}`,
    );
  }

  await assertSendableIntegration(subdomain);

  const disconnected = await findDisconnectedPipelineMail(models, pipelineId);

  if (disconnected) {
    return models.MailIntegrations.findOneAndUpdate(
      { _id: disconnected._id },
      {
        $set: {
          name: pipeline.name,
          senderName: normalizeSenderName(senderName),
          healthStatus: MAIL_HEALTH_STATUSES.HEALTHY,
          error: '',
          disabledAt: null,
          ...forwardSetupFields(
            normalizeForwardFrom(forwardFrom, disconnected.address),
          ),
        },
      },
      { new: true },
    ) as Promise<IMailIntegrationDocument>;
  }

  const address = await buildMailAddress(subdomain, pipeline.name);

  await releaseAddress(models, address);

  return models.MailIntegrations.create({
    pipelineId,
    name: pipeline.name,
    address,
    senderName: normalizeSenderName(senderName),
    healthStatus: MAIL_HEALTH_STATUSES.HEALTHY,
    error: '',
    ...forwardSetupFields(normalizeForwardFrom(forwardFrom, address)),
  });
};

export const updatePipelineMail = async (
  models: IModels,
  pipelineId: string,
  { senderName, forwardFrom }: IPipelineMailSettings,
): Promise<IMailIntegrationDocument> => {
  const integration = await findPipelineIntegration(models, pipelineId);

  if (!integration) {
    throw new Error('This pipeline has no mail address');
  }

  const update: Record<string, unknown> = {
    healthStatus: MAIL_HEALTH_STATUSES.HEALTHY,
    error: '',
  };

  if (senderName !== undefined) {
    update.senderName = normalizeSenderName(senderName);
  }

  if (forwardFrom !== undefined) {
    const wanted = normalizeForwardFrom(forwardFrom, integration.address);

    if (wanted !== (integration.forwardFrom ?? '')) {
      Object.assign(update, forwardSetupFields(wanted));
    }
  }

  return models.MailIntegrations.findOneAndUpdate(
    { _id: integration._id },
    { $set: update },
    { new: true },
  ) as Promise<IMailIntegrationDocument>;
};

export const markPipelineForwardVerified = async (
  models: IModels,
  pipelineId: string,
): Promise<IMailIntegrationDocument> => {
  const integration = await findPipelineIntegration(models, pipelineId);

  if (!integration) {
    throw new Error('This pipeline has no mail address');
  }

  return models.MailIntegrations.findOneAndUpdate(
    { _id: integration._id },
    { $unset: { forwardPendingAt: '', forwardVerification: '' } },
    { new: true },
  ) as Promise<IMailIntegrationDocument>;
};

export const disconnectPipelineMail = async (
  models: IModels,
  pipelineId: string,
) => {
  const integration = await findPipelineIntegration(models, pipelineId);

  if (!integration) {
    throw new Error('This pipeline has no mail address');
  }

  await models.MailIntegrations.updateOne(
    { _id: integration._id },
    { $set: { disabledAt: new Date() } },
  );

  return true;
};
