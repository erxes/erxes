import { lookup as dnsLookup } from 'node:dns';
import { lookup as dnsLookupAll } from 'node:dns/promises';
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

  // An IPv6 literal keeps its brackets in `hostname`, and Node connects to a literal without a lookup.
  const host = url.hostname.replace(/^\[(.*)\]$/, '$1');

  if (!config.outbound.allowPrivate && isIP(host) && isPrivateAddress(host)) {
    throw new OutboundError('Private and local addresses are not allowed');
  }

  return url;
};

/**
 * The address to connect to for a host members type in, for services that
 * aren't HTTP (an SMTP server): refused when it is, or resolves to, a private
 * one. Connect to what it returns, so DNS can't change it in between.
 */
export const publicAddressOf = async (host: string) => {
  const addresses = isIP(host) ? [{ address: host }] : await dnsLookupAll(host, { all: true });
  const [first] = addresses;

  if (!config.outbound.allowPrivate && addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new OutboundError(`${host} is a private address`);
  }

  if (!first) throw new OutboundError(`${host} has no address`);

  return first.address;
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

const BODILESS = new Set(['GET', 'HEAD']);

export interface OutboundRequest {
  method: string;
  /** Empty for none. */
  body: Buffer | string;
  headers: Record<string, string>;
  timeoutMs?: number;
  /** The body read at most; the rest is dropped. */
  maxBytes?: number;
  /** `fail` rejects an answer longer than `maxBytes` instead of cutting it. */
  overflow?: 'cut' | 'fail';
}

export interface OutboundAnswer {
  status: number;
  headers: IncomingHttpHeaders;
  body: Buffer;
  ms: number;
}

/**
 * Sends one request; resolves with any HTTP answer, its body cut at `maxBytes`, rejects on
 * network errors and timeouts. Never inside a tenant scope: a slow remote would hold its
 * transaction and row locks open. Read in a short scope, call out after it.
 */
export const requestOutbound = async (raw: string, request: OutboundRequest) => {
  if (openScope()) {
    throw new Error(
      'An outbound call was made inside a database transaction; call out after it ends',
    );
  }

  const { method, body, headers, timeoutMs = 10_000, maxBytes = 2048, overflow = 'cut' } = request;
  const url = assertOutboundUrl(raw);
  const started = Date.now();
  const send = url.protocol === 'https:' ? httpsRequest : httpRequest;

  return new Promise<OutboundAnswer>((resolve, reject) => {
    const req = send(
      url,
      {
        method,
        // A GET or HEAD without a body sends no length; anything else says its length, 0 too.
        headers:
          body.length || !BODILESS.has(method)
            ? { ...headers, 'Content-Length': String(Buffer.byteLength(body)) }
            : headers,
        lookup: safeLookup,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;

        res.on('data', (chunk: Buffer) => {
          if (size < maxBytes) chunks.push(chunk);
          size += chunk.length;

          if (size > maxBytes && overflow === 'fail') {
            res.destroy(new OutboundError(`the answer is over ${maxBytes} bytes`));
          }
        });
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).subarray(0, maxBytes),
            ms: Date.now() - started,
          }),
        );
        res.on('error', reject);
      },
    );

    req.on('timeout', () =>
      req.destroy(new OutboundError(`no answer within ${timeoutMs / 1000} s`)),
    );
    req.on('error', reject);
    req.end(body);
  });
};

/** POSTs `body` and reads the first 2 KB of the answer, as `requestOutbound`. */
export const postOutbound = async (
  raw: string,
  body: string,
  headers: Record<string, string>,
  timeoutMs = 10_000,
): Promise<OutboundResponse> => {
  const answer = await requestOutbound(raw, { method: 'POST', body, headers, timeoutMs });

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
    const answer = await requestOutbound(request.url, {
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
