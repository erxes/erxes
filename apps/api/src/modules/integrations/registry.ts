import { INTEGRATIONS as PACKAGED } from '@erxes/integrations/server';
import { fail, notFound } from '~/http/errors';
import { facebook } from './apps/facebook';
import { github } from './apps/github';
import { googleSheets } from './apps/googleSheets';
import { telegram } from './apps/telegram';
import type { ClientOptions, Integration } from './define';
import { golomtBank, khanbankBank, tdbBank } from './banks';
import { ebarimt } from './ebarimt';
import { golomt } from './gateways/golomt';
import { hipay } from './gateways/hipay';
import { monpay } from './gateways/monpay';
import { paypal } from './gateways/paypal';
import { pocket } from './gateways/pocket';
import { quickqr } from './gateways/quickqr';
import { socialpay } from './gateways/socialpay';
import { storepay } from './gateways/storepay';
import { tdb } from './gateways/tdb';
import { test } from './gateways/test';
import { toki } from './gateways/toki';
import { golomtTransfer, khanbankTransfer, tdbTransfer } from './gateways/transfers';
import { wechatpay } from './gateways/wechatpay';

export const INTEGRATIONS: readonly Integration[] = [
  ebarimt,
  ...PACKAGED,
  quickqr,
  socialpay,
  monpay,
  storepay,
  pocket,
  toki,
  golomt,
  tdb,
  khanbankTransfer,
  tdbTransfer,
  golomtTransfer,
  hipay,
  paypal,
  wechatpay,
  github,
  telegram,
  googleSheets,
  facebook,
  test,
  khanbankBank,
  golomtBank,
  tdbBank,
];

const BY_KEY = new Map(INTEGRATIONS.map((integration) => [integration.key, integration]));

const integrationOf = (key: string) => {
  const integration = BY_KEY.get(key);

  if (!integration) throw notFound('Integration');

  return integration;
};

export const keyedOf = (key: string) => {
  const integration = integrationOf(key);

  if (!integration.keys) throw fail('NOT_FOUND', `${integration.name} is set up on its own page`);

  return integration;
};

export const PAYMENT_KEYS = INTEGRATIONS.flatMap((integration) =>
  integration.payments ? [integration.key] : [],
);

/** The integrations that send the organisation's texts (CallPro, Twilio). */
export const SMS_KEYS = INTEGRATIONS.flatMap((integration) =>
  integration.smsSending ? [integration.key] : [],
);

export const gatewayOf = (key: string) => {
  const integration = integrationOf(key);

  if (!integration.payments) throw new Error(`${key} is not a payment gateway`);

  return { ...integration, payments: integration.payments };
};

export const openGateway = (key: string, keys: unknown, options: ClientOptions = {}) => {
  const gateway = gatewayOf(key);

  return { payments: gateway.payments, client: gateway.client(gateway.keys.parse(keys), options) };
};
