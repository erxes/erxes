import { sendTRPCMessage } from 'erxes-api-shared/utils';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { IDoc, IEbarimtFull } from './@types';
import { getEbarimtData, getPostData } from './utils';

export type PutResponseDetail = Partial<IEbarimtFull> & {
  _id: string;
  id: string;
  status: string;
};

interface GetPutResponseDetailParams {
  contentId: string;
  contentType: string;
  isTemp?: boolean;
  models: IModels;
  stageId?: string;
  subdomain: string;
}

export const getPutResponseDetail = async ({
  contentId,
  contentType,
  isTemp,
  models,
  stageId,
  subdomain,
}: GetPutResponseDetailParams): Promise<PutResponseDetail | null> => {
  const putHistory = await models.PutResponses.putHistory({
    contentType,
    contentId,
  });

  if (putHistory) {
    return putHistory;
  }

  if (!isTemp) {
    throw new Error('Ebarimt not found');
  }

  if (contentType !== 'deal') {
    return null;
  }

  const deal = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'deal',
    action: 'findOne',
    input: { _id: contentId },
    defaultValue: {},
  });
  const dealData = deal || {};
  const resolvedStageId = stageId || dealData.stageId;

  if (!dealData._id || !resolvedStageId) {
    throw new Error('Deal not found');
  }

  const configValue = await models.Configs.getConfigValue(
    'stageInEbarimt',
    resolvedStageId,
  );

  if (!configValue) {
    throw new Error('Ebarimt config not found');
  }

  const config = {
    ...(await models.Configs.getConfigValue('EBARIMT', '', {})),
    ...configValue,
  };

  const pipeline = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'pipeline',
    action: 'findOne',
    input: { stageId: resolvedStageId },
    defaultValue: {},
  });

  const ebarimtData: IDoc = await getPostData(
    subdomain,
    models,
    config,
    dealData,
    pipeline?.paymentTypes,
  );
  const { status, msg, data, innerData } = await getEbarimtData({
    config,
    doc: ebarimtData,
  });

  if (status !== 'ok' || (!data && !innerData)) {
    return {
      _id: nanoid(),
      id: 'Error',
      status: 'ERROR',
      message: msg,
    };
  }

  const response = data || innerData;

  if (!response) {
    return null;
  }

  return {
    ...response,
    _id: nanoid(),
    id: 'Түр баримт',
    status: 'SUCCESS',
    date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    registerNo: config.companyRD || '',
  };
};
