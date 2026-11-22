import { z } from 'zod';
import { hmacSha256, safeEqual } from '~/lib/crypto';
import {
  type AppWideHooks,
  DeliveryRefused,
  digits,
  GatewayError,
  type OAuthKeys,
  record,
  Text,
} from '@erxes/plugin-sdk/integrations';
import { logger } from '~/logger';
import { metaRelayFor } from '../metaRelay';
import { Lead, LEAD_FIELDS, leadPayload, pageEvents } from './facebookEvents';
import { appToken, Done, graph, pageAccess, pageToken } from './facebookGraph';

export const pageScope = z.object({ page: record('Facebook page', 'page', { schema: digits() }) });

type Enrich = NonNullable<NonNullable<AppWideHooks<OAuthKeys, typeof pageScope>['enrich']>[string]>;

const log = logger.child({ component: 'facebook-hooks' });

const PROFILE_FIELDS = 'name,first_name,last_name,profile_pic';

const Handshake = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string().max(200),
});

const LeadRef = z.object({ leadId: z.string().min(1) });

const pagePath = (page: string) => `/${encodeURIComponent(page)}/subscribed_apps`;

const PageApps = z.object({
  data: z.array(z.object({ id: Text, subscribed_fields: z.array(z.string()).default([]) })),
});

const sharedFields = async (token: string, page: string, appId: string) => {
  const { data } = await graph(`${pagePath(page)}?fields=id,subscribed_fields`, PageApps, {
    token,
  });

  return data.find((app) => app.id === appId)?.subscribed_fields ?? [];
};

const refused = (error: unknown) =>
  error instanceof GatewayError &&
  error.status !== null &&
  error.status >= 400 &&
  error.status < 500;

const Profile = z.object({
  name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  profile_pic: z.string().optional(),
});

const SenderRef = z.object({ senderId: z.string().min(1) });

const profileOf = async (token: string, senderId: string, page: string) => {
  try {
    const person = await graph(
      `/${encodeURIComponent(senderId)}?fields=${PROFILE_FIELDS}`,
      Profile,
      {
        token,
      },
    );

    return {
      senderName: person.name,
      senderFirstName: person.first_name,
      senderLastName: person.last_name,
      senderPicture: person.profile_pic,
    };
  } catch (error) {
    if (!refused(error)) throw error;

    log.info({ page, senderId, err: error }, 'Messenger sender profile not shared');

    return {};
  }
};

const withSender: Enrich = async ({ keys, scope, payload }) => {
  const { senderId } = SenderRef.parse(payload);
  const page = await pageAccess(keys.accessToken, scope.page);

  return {
    ...payload,
    pageName: page.name,
    ...(await profileOf(page.token, senderId, scope.page)),
  };
};

export const facebookHooks: AppWideHooks<OAuthKeys, typeof pageScope> = {
  appWide: true,
  scope: pageScope,
  route: (scope) => scope.page,
  async subscribe({ keys, scope, client, url, verifyToken, events, appEvents }) {
    const relay = metaRelayFor('facebook');
    const token = await pageToken(keys.accessToken, scope.page);

    if (relay) await relay.route(scope.page, url);
    else
      await graph(`/${encodeURIComponent(client.clientId)}/subscriptions`, Done, {
        token: appToken(client),
        method: 'POST',
        body: {
          object: 'page',
          callback_url: url,
          verify_token: verifyToken,
          fields: appEvents.join(','),
          include_values: true,
        },
      });

    const fields = relay
      ? new Set([...(await sharedFields(token, scope.page, client.clientId)), ...events])
      : events;

    await graph(pagePath(scope.page), Done, {
      token,
      method: 'POST',
      body: { subscribed_fields: [...fields].join(',') },
    });
  },
  async unsubscribe({ keys, scope }) {
    const relay = metaRelayFor('facebook');

    if (relay) return relay.unroute(scope.page);

    try {
      await graph(pagePath(scope.page), Done, {
        token: await pageToken(keys.accessToken, scope.page),
        method: 'DELETE',
      });
    } catch (error) {
      if (!refused(error)) throw error;
    }
  },
  receive(delivery, { secret, verifyToken }) {
    if (delivery.method === 'GET') {
      const handshake = Handshake.safeParse(delivery.query);

      if (!handshake.success || !safeEqual(handshake.data['hub.verify_token'], verifyToken))
        throw new DeliveryRefused('the Facebook verify token does not match');

      return { reply: { status: 200, body: handshake.data['hub.challenge'] }, routes: [] };
    }

    const expected = `sha256=${hmacSha256(secret, delivery.raw, 'hex')}`;

    if (!safeEqual(delivery.headers['x-hub-signature-256'] ?? '', expected))
      throw new DeliveryRefused('the Facebook signature does not match');

    return { routes: pageEvents(delivery.body) };
  },
  enrich: {
    async leadgen({ keys, scope, payload }) {
      const { leadId } = LeadRef.parse(payload);
      const page = await pageAccess(keys.accessToken, scope.page);

      const lead = await graph(`/${encodeURIComponent(leadId)}?fields=${LEAD_FIELDS}`, Lead, {
        token: page.token,
      });

      return { ...leadPayload(lead, payload), pageName: page.name };
    },
    messages: withSender,
    messaging_postbacks: withSender,
    messaging_referrals: withSender,
  },
};
