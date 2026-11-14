import { lookup as dnsLookup } from 'node:dns';
import { type IncomingHttpHeaders, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP, type LookupFunction } from 'node:net';
import { openScope } from '@erxes/core-db';
import ipaddr from 'ipaddr.js';
import { config } from '~/config';

/**
 * Requests to addresses members type in (webhooks, automation calls). Outside
 * development they must be https and may only reach public unicast addresses,
 * checked on the address actually connected to, so DNS can't be used to slip
 * past (SSRF).
 */

/**
 * Anything but a public unicast address: private, loopback, link-local,
 * metadata, multicast, reserved, and IPv6 forms that carry an IPv4 address
 * (NAT64, 6to4, Teredo). IPv4-mapped IPv6 is judged as its IPv4 address.
 */
export const isPrivateAddress = (address: string) =>
  !ipaddr.isValid(address) || ipaddr.process(address).range() !== 'unicast';

export class OutboundError extends Error {}

/** Checks a URL members give before saving it. */
export const assertOutboundUrl = (raw: string) => {
  const url = new URL(raw);

  if (url.protocol !== 'https:' && !(config.outbound.allowPrivate && url.protocol === 'http:')) {
    throw new OutboundError('Use an https address');
  }

  if (url.username || url.password) throw new OutboundError("Don't put credentials in the address");

  if (!config.outbound.allowPrivate && isIP(url.hostname) && isPrivateAddress(url.hostname)) {
    throw new OutboundError('Private and local addresses are not allowed');
  }

  return url;
};

/** Resolves like `dns.lookup`, refusing hosts with a private address (checked where it connects). */
const safeLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, '');

    const [first] = addresses;

    const bad =
      !config.outbound.allowPrivate && addresses.some((entry) => isPrivateAddress(entry.address));

    if (bad || !first) {
      return callback(new OutboundError(`${hostname} resolves to a private address`), '');
    }

    return options.all ? callback(null, addresses) : callback(null, first.address, first.family);
  });
};

export interface OutboundResponse {
  status: number;
  /** The first 2 KB of the body. */
  body: string;
  ms: number;
}

interface OutboundRequest {
  method: string;
  body: string;
  headers: Record<string, string>;
  timeoutMs: number;
  maxBytes: number;
  overflow: 'cut' | 'fail';
}

const sendOutbound = (raw: string, request: OutboundRequest) => {
  if (openScope()) {
    throw new Error(
      'An outbound call was made inside a database transaction; call out after it ends',
    );
  }

  const url = assertOutboundUrl(raw);
  const started = Date.now();
  const send = url.protocol === 'https:' ? httpsRequest : httpRequest;

  return new Promise<{ status: number; headers: IncomingHttpHeaders; body: Buffer; ms: number }>(
    (resolve, reject) => {
      const req = send(
        url,
        {
          method: request.method,
          headers: {
            ...request.headers,
            'Content-Length': String(Buffer.byteLength(request.body)),
          },
          lookup: safeLookup,
          timeout: request.timeoutMs,
        },
        (res) => {
          const chunks: Buffer[] = [];
          let size = 0;

          res.on('data', (chunk: Buffer) => {
            if (size < request.maxBytes) chunks.push(chunk);
            size += chunk.length;

            if (size > request.maxBytes && request.overflow === 'fail') {
              res.destroy(new OutboundError(`the answer is over ${request.maxBytes} bytes`));
            }
          });
          res.on('end', () =>
            resolve({
              status: res.statusCode ?? 0,
              headers: res.headers,
              body: Buffer.concat(chunks),
              ms: Date.now() - started,
            }),
          );
          res.on('error', reject);
        },
      );

      req.on('timeout', () =>
        req.destroy(new OutboundError(`no answer within ${request.timeoutMs / 1000} s`)),
      );
      req.on('error', reject);
      req.end(request.body);
    },
  );
};

/**
 * POSTs `body`; resolves with any HTTP answer, rejects on network errors and
 * timeouts. Never inside a tenant scope: a slow remote would hold its
 * transaction and row locks open. Read in a short scope, call out after it.
 */
export const postOutbound = async (
  raw: string,
  body: string,
  headers: Record<string, string>,
  timeoutMs = 10_000,
): Promise<OutboundResponse> => {
  const answer = await sendOutbound(raw, {
    method: 'POST',
    body,
    headers,
    timeoutMs,
    maxBytes: 2048,
    overflow: 'cut',
  });

  return {
    status: answer.status,
    body: answer.body.toString('utf8').slice(0, 2048),
    ms: answer.ms,
  };
};

const headersOf = (incoming: IncomingHttpHeaders) => {
  const headers = new Headers();

  for (const [name, value] of Object.entries(incoming)) {
    for (const item of [value ?? []].flat()) headers.append(name, item);
  }

  return headers;
};

export const outboundFetch =
  (options: { timeoutMs: number; maxBytes: number }) => async (request: Request) => {
    const answer = await sendOutbound(request.url, {
      method: request.method,
      body: await request.text(),
      headers: Object.fromEntries(request.headers),
      ...options,
      overflow: 'fail',
    });

    return new Response(answer.status === 204 ? null : new Uint8Array(answer.body), {
      status: answer.status,
      headers: headersOf(answer.headers),
    });
  };
