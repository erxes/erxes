import { IContext } from '~/connectionResolvers';
import { IClientPortal } from '@/clientportal/types/clientPortal';
import { getTokiConnection } from '@/clientportal/utils';

export const clientPortalMutations = {
  async clientPortalAdd(
    _root: unknown,
    { name }: { name: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.createClientPortal(name);
  },
  async clientPortalUpdate(
    _root: unknown,
    { _id, clientPortal }: { _id: string; clientPortal: IClientPortal },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.updateClientPortal(_id, clientPortal);
  },

  async clientPortalDelete(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.findOneAndDelete({ _id });
  },

  async clientPortalChangeToken(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.clientPortalChangeToken(_id);
  },

  async clientPortalCheckTokiInvoice(
    _root: unknown,
    {
      clientPortalId,
      transactionId,
    }: { clientPortalId: string; transactionId: string },
    { models }: IContext,
  ) {
    const clientPortal = await models.ClientPortal.findOne({
      _id: clientPortalId,
    });

    if (!clientPortal) {
      throw new Error('Client portal not found');
    }

    const tokiConfig = clientPortal.auth?.tokiConfig;

    if (!tokiConfig?.username || !tokiConfig.password) {
      throw new Error('Toki credentials are not set');
    }

    const { apiUrl, apiKey } = getTokiConnection(clientPortal);
    const authString = Buffer.from(
      `${tokiConfig.username}:${tokiConfig.password}`,
    ).toString('base64');

    const tokenResponse = await fetch(
      `${apiUrl}/third-party-service/v1/auth/token`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${authString}`,
        },
      },
    );

    if (!tokenResponse.ok) {
      throw new Error('Unable to authenticate with Toki');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData?.data?.accessToken;

    if (!accessToken) {
      throw new Error('Toki access token was not returned');
    }

    const invoiceResponse = await fetch(
      `${apiUrl}/third-party-service/v1/payment-request/status?requestId=${encodeURIComponent(transactionId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'api-key': apiKey,
        },
      },
    );

    if (!invoiceResponse.ok) {
      throw new Error('Unable to check Toki invoice');
    }

    return invoiceResponse.json();
  },
};
