import { generateModels } from '~/connectionResolvers';
import {
  removeIntegration,
  updateIntegration,
  whatsappCreateIntegration,
} from '@/integrations/whatsapp/helpers';
import { handleWhatsappMessage } from '@/integrations/whatsapp/handleWhatsappMessage';

interface IIntegrationMessage<TData> {
  subdomain: string;
  data: TData;
}

interface ICreateData {
  integrationId: string;
  data?: string;
  kind: string;
}

interface IUpdateData {
  integrationId: string;
  doc: {
    data?: string;
  };
}

interface IIntegrationIdData {
  integrationId: string;
}

interface IDispatchData {
  action: string;
  type: string;
  payload: string;
}

export const handleWhatsappIntegration = async ({
  subdomain,
  data,
}: IIntegrationMessage<IDispatchData>) => {
  const models = await generateModels(subdomain);
  const response: {
    status: 'success' | 'error';
    data?: unknown;
    errorMessage?: string;
  } = {
    status: 'success',
  };

  try {
    if (data.type === 'whatsapp') {
      response.data = await handleWhatsappMessage(models, data);
    }
  } catch (e) {
    response.status = 'error';
    response.errorMessage = e.message;
  }

  return response;
};

export const whatsappCreateIntegrations = async ({
  subdomain,
  data,
}: IIntegrationMessage<ICreateData>) => {
  try {
    return await whatsappCreateIntegration(subdomain, data);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to create integration: ${e.message}`,
    };
  }
};

export const whatsappUpdateIntegrations = async ({
  subdomain,
  data,
}: IIntegrationMessage<IUpdateData>) => {
  try {
    return await updateIntegration(
      subdomain,
      data.integrationId,
      data.doc.data,
    );
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to update integration: ${e.message}`,
    };
  }
};

export const whatsappRemoveIntegrations = async ({
  subdomain,
  data,
}: IIntegrationMessage<IIntegrationIdData>) => {
  try {
    return await removeIntegration(subdomain, data.integrationId);
  } catch (e) {
    return {
      status: 'error',
      errorMessage: `Failed to remove integration: ${e.message}`,
    };
  }
};

export const whatsappStatus = async ({
  subdomain,
  data,
}: IIntegrationMessage<IIntegrationIdData>) => {
  try {
    const models = await generateModels(subdomain);
    const integration = await models.WhatsappIntegrations.findOne({
      erxesApiId: data.integrationId,
    });

    return {
      data: {
        status: integration?.healthStatus || 'healthy',
        error: integration?.error,
      },
      status: 'success',
    };
  } catch (e) {
    return {
      data: {
        status: 'error',
        error: e.message,
      },
      status: 'error',
    };
  }
};
