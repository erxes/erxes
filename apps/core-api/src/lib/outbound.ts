import { lookup as dnsLookup } from 'node:dns';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { BlockList, isIP, type LookupFunction } from 'node:net';
import { config } from '~/config';

/**
 * Requests to addresses members type in (webhooks, automation calls). Outside
 * development they must be https and may not reach private, loopback,
 * link-local or metadata addresses — checked on the address actually
 * connected to, so DNS can't be used to slip past (SSRF).
 */

const blocked = new BlockList();

for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 3],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv4');
}

for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv6');
}

export const isPrivateAddress = (address: string) => {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address)?.[1];

  if (mapped) return blocked.check(mapped, 'ipv4');

  const family = isIP(address);

  return family === 4
    ? blocked.check(address, 'ipv4')
    : family === 6
      ? blocked.check(address, 'ipv6')
      : true;
};

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

/** POSTs `body`; resolves with any HTTP answer, rejects on network errors and timeouts. */
export const postOutbound = async (
  raw: string,
  body: string,
  headers: Record<string, string>,
  timeoutMs = 10_000,
) => {
  const url = assertOutboundUrl(raw);
  const started = Date.now();
  const send = url.protocol === 'https:' ? httpsRequest : httpRequest;

  return new Promise<OutboundResponse>((resolve, reject) => {
    const req = send(
      url,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Length': String(Buffer.byteLength(body)) },
        lookup: safeLookup,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;

        res.on('data', (chunk: Buffer) => {
          if (size < 2048) chunks.push(chunk);
          size += chunk.length;
        });
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString('utf8').slice(0, 2048),
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
