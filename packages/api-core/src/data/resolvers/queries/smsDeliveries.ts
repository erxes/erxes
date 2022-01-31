import { debugExternalApi } from '../../../debuggers';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface ISmsDeliveryParams {
  type: string;
  to: string;
  page?: number;
  perPage?: number;
}

const smsDeliveryQueries = {
  async smsDeliveries(
    _root,
    params: ISmsDeliveryParams,
    { dataSources }: IContext
  ) {
    const { type } = params;

    if (!type) {
      throw new Error('SMS delivery type must be chosen');
    }

    try {
      let response: any = {};

      if (type === 'campaign') {
        response = await dataSources.EngagesAPI.getSmsDeliveries(params);
      }
      if (type === 'integration') {
        response = await dataSources.IntegrationsAPI.getSmsDeliveries(params);
      }
      if (response.status !== 'ok' && response.error) {
        throw new Error(response.error);
      }

      return { list: response.data, totalCount: response.totalCount };
    } catch (e) {
      debugExternalApi(e);
      return { error: e.message };
    }
  }
};

moduleRequireLogin(smsDeliveryQueries);

export default smsDeliveryQueries;
