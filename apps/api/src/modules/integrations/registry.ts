import { fail, notFound } from '~/http/errors';
import type { Integration } from './define';
import { golomtBank, khanbankBank, tdbBank } from './banks';
import { ebarimt } from './ebarimt';
import { golomt } from './gateways/golomt';
import { hipay } from './gateways/hipay';
import { monpay } from './gateways/monpay';
import { paypal } from './gateways/paypal';
import { pocket } from './gateways/pocket';
import { qpay } from './gateways/qpay';
import { quickqr } from './gateways/quickqr';
import { socialpay } from './gateways/socialpay';
import { storepay } from './gateways/storepay';
import { stripe } from './gateways/stripe';
import { tdb } from './gateways/tdb';
import { test } from './gateways/test';
import { toki } from './gateways/toki';
import { golomtTransfer, khanbankTransfer, tdbTransfer } from './gateways/transfers';
import type { ClientOptions } from './gateways/types';
import { wechatpay } from './gateways/wechatpay';

export const INTEGRATIONS: readonly Integration[] = [
  ebarimt,
  qpay,
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
  stripe,
  paypal,
  wechatpay,
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

export const gatewayOf = (key: string) => {
  const integration = integrationOf(key);

  if (!integration.payments) throw new Error(`${key} is not a payment gateway`);

  return { ...integration, payments: integration.payments };
};

export const openGateway = (key: string, keys: unknown, options: ClientOptions = {}) => {
  const gateway = gatewayOf(key);

  return { payments: gateway.payments, client: gateway.client(gateway.keys.parse(keys), options) };
};
