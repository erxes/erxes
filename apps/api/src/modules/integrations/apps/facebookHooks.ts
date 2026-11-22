import { z } from 'zod';
import { hmacSha256, safeEqual } from '~/lib/crypto';
import {
  type AppWideHooks,
  DeliveryRefused,
  digits,
  field,
  GatewayError,
  type OAuthKeys,
} from '@erxes/plugin-sdk/integrations';
import { Lead, LEAD_FIELDS, leadPayload, pageEvents } from './facebookEvents';
import { appToken, Done, graph, pageToken } from './facebookGraph';

export const pageScope = z.object({ page: field('Facebook page id', digits()) });

const Handshake = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string().max(200),
});

const LeadRef = z.object({ leadId: z.string().min(1) });

const pagePath = (page: string) => `/${encodeURIComponent(page)}/subscribed_apps`;

const pageGone = (error: unknown) =>
  error instanceof GatewayError &&
  error.status !== null &&
  error.status >= 400 &&
  error.status < 500;

export const facebookHooks: AppWideHooks<OAuthKeys, typeof pageScope> = {
  appWide: true,
  scope: pageScope,
  route: (scope) => scope.page,
  async subscribe({ keys, scope, client, url, verifyToken, events, appEvents }) {
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

    await graph(pagePath(scope.page), Done, {
      token: await pageToken(keys.accessToken, scope.page),
      method: 'POST',
      body: { subscribed_fields: events.join(',') },
    });
  },
  async unsubscribe({ keys, scope }) {
    try {
      await graph(pagePath(scope.page), Done, {
        token: await pageToken(keys.accessToken, scope.page),
        method: 'DELETE',
      });
    } catch (error) {
      if (!pageGone(error)) throw error;
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

      const lead = await graph(`/${encodeURIComponent(leadId)}?fields=${LEAD_FIELDS}`, Lead, {
        token: await pageToken(keys.accessToken, scope.page),
      });

      return leadPayload(lead, payload);
    },
  },
};
