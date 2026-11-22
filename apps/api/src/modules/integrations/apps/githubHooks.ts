import { z } from 'zod';
import { hmacSha256, safeEqual } from '~/lib/crypto';
import { type AppHooks, DeliveryRefused, field } from '../define';
import { gatewayHttp, json, parse, Text } from '../gateways/http';
import { type DriverOptions, GatewayError } from '../gateways/types';
import { githubPayload } from './githubEvents';

type GithubKeys = { accessToken: string };

const repository = z.object({ owner: field('Owner'), repository: field('Repository') });

type Repository = z.output<typeof repository>;

export const githubSend = (
  keys: GithubKeys,
  method: string,
  path: string,
  body?: unknown,
  options: DriverOptions = {},
) =>
  gatewayHttp(
    'GitHub',
    'https://api.github.com',
    options,
  )(path, {
    method,
    headers: {
      Authorization: `Bearer ${keys.accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body === undefined ? undefined : json(body),
  });

const hooksPath = ({ owner, repository: name }: Repository) =>
  `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/hooks`;

const Hook = z.object({ id: Text });

const statusOf = (error: unknown) => (error instanceof GatewayError ? error.status : null);

const hookBody = (url: string, secret: string, events: string[]) => ({
  active: true,
  events,
  config: { url, content_type: 'json', secret, insecure_ssl: '0' },
});

export const githubHooks: AppHooks<GithubKeys, typeof repository> = {
  scope: repository,
  async subscribe({ keys, scope, url, secret, events, externalId }) {
    if (externalId) {
      try {
        const updated = parse(
          'GitHub',
          Hook,
          await githubSend(
            keys,
            'PATCH',
            `${hooksPath(scope)}/${encodeURIComponent(externalId)}`,
            hookBody(url, secret, events),
          ),
          'no webhook',
        );

        return { externalId: updated.id };
      } catch (error) {
        if (statusOf(error) !== 404) throw error;
      }
    }

    try {
      const made = parse(
        'GitHub',
        Hook,
        await githubSend(keys, 'POST', hooksPath(scope), {
          name: 'web',
          ...hookBody(url, secret, events),
        }),
        'no webhook',
      );

      return { externalId: made.id };
    } catch (error) {
      const status = statusOf(error);

      if (status === 403)
        throw new GatewayError(
          `GitHub won't let this token add webhooks to ${scope.owner}/${scope.repository}: give the token the Webhooks permission (read and write) on that repository`,
          status,
        );

      if (status === 404)
        throw new GatewayError(
          `GitHub can't find ${scope.owner}/${scope.repository} for this token: check the owner and repository names, and that the token can reach the repository`,
          status,
        );

      throw error;
    }
  },
  async unsubscribe({ keys, scope, externalId }) {
    try {
      await githubSend(keys, 'DELETE', `${hooksPath(scope)}/${encodeURIComponent(externalId)}`);
    } catch (error) {
      if (statusOf(error) !== 404) throw error;
    }
  },
  receive(delivery, secret) {
    const expected = `sha256=${hmacSha256(secret, delivery.raw, 'hex')}`;

    if (!safeEqual(delivery.headers['x-hub-signature-256'] ?? '', expected))
      throw new DeliveryRefused('the GitHub signature does not match');

    const type = delivery.headers['x-github-event'];
    const id = delivery.headers['x-github-delivery'];
    const payload = type && type !== 'ping' ? githubPayload(type, delivery.body) : null;

    if (!type || !id || !payload) return { events: [] };

    return { events: [{ id, type, payload }] };
  },
};
