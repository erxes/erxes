import { z } from 'zod';
import {
  type AppHooks,
  type ClientOptions,
  DeliveryRefused,
  GatewayError,
  gatewayHttp,
  hmacSha256,
  parse,
  safeEqual,
} from '@erxes/plugin-sdk/integrations';
import { EVENT, rowOf, scalarsOf } from './fields';
import { fieldsOf } from './triggers';

type StripeKeys = { secretKey: string };

const TOLERANCE_SECONDS = 300;

const Endpoint = z.object({ id: z.string().min(1), secret: z.string().optional() });

const StripeEvent = z.looseObject({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({ object: z.record(z.string(), z.unknown()) }),
});

const stripeMessage = (text: string) => {
  const quoted = /"message":\s*("(?:[^"\\]|\\.)*")/.exec(text)?.[1];

  if (!quoted) return null;

  try {
    return z.string().min(1).parse(JSON.parse(quoted));
  } catch {
    return null;
  }
};

export const stripeSend = async (
  keys: StripeKeys,
  method: string,
  path: string,
  form?: URLSearchParams,
  headers: Record<string, string> = {},
  options: ClientOptions = {},
) => {
  try {
    return await gatewayHttp(
      'Stripe',
      'https://api.stripe.com/v1',
      options,
    )(path, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${keys.secretKey}`,
        ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: form?.toString(),
    });
  } catch (error) {
    if (!(error instanceof GatewayError)) throw error;

    const said = stripeMessage(error.message);

    throw said ? new GatewayError(`Stripe: ${said}`, error.status) : error;
  }
};

const endpointForm = (url: string | null, events: string[]) => {
  const form = new URLSearchParams();

  if (url) {
    form.set('url', url);
    form.set('description', 'erxes automations');
  }

  events.forEach((event) => form.append('enabled_events[]', event));

  return form;
};

const missing = (error: unknown) => error instanceof GatewayError && error.status === 404;

const signed = (header: string | undefined) => {
  const parts = (header ?? '').split(',').map((part) => part.split('='));
  const at = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.flatMap(([key, value]) => (key === 'v1' && value ? [value] : []));

  return { at: Number(at), signatures };
};

export const stripeHooks: AppHooks<StripeKeys> = {
  scope: z.object({}),
  async subscribe({ keys, url, events, externalId }) {
    if (externalId) {
      try {
        const updated = parse(
          'Stripe',
          Endpoint,
          await stripeSend(
            keys,
            'POST',
            `/webhook_endpoints/${encodeURIComponent(externalId)}`,
            endpointForm(null, events),
          ),
          'no webhook endpoint',
        );

        return { externalId: updated.id };
      } catch (error) {
        if (!missing(error)) throw error;
      }
    }

    const made = parse(
      'Stripe',
      Endpoint,
      await stripeSend(keys, 'POST', '/webhook_endpoints', endpointForm(url, events)),
      'no webhook endpoint',
    );

    return { externalId: made.id, secret: made.secret };
  },
  async unsubscribe({ keys, externalId }) {
    try {
      await stripeSend(keys, 'DELETE', `/webhook_endpoints/${encodeURIComponent(externalId)}`);
    } catch (error) {
      if (!missing(error)) throw error;
    }
  },
  receive(delivery, secret) {
    const { at, signatures } = signed(delivery.headers['stripe-signature']);
    const expected = hmacSha256(secret, `${at}.${delivery.raw}`, 'hex');

    if (!Number.isFinite(at) || !signatures.some((value) => safeEqual(value, expected)))
      throw new DeliveryRefused('the Stripe signature does not match');

    if (Math.abs(Date.now() / 1000 - at) > TOLERANCE_SECONDS)
      throw new DeliveryRefused('the Stripe signature is too old');

    const event = StripeEvent.safeParse(delivery.body);

    if (!event.success) return { events: [] };

    const { id, type, data } = event.data;

    return {
      events: [
        {
          id,
          type,
          payload: {
            ...scalarsOf(data.object),
            ...rowOf(fieldsOf.get(type) ?? [], data.object),
            ...rowOf(EVENT, event.data),
          },
        },
      ],
    };
  },
};
