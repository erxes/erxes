import { lookup } from 'node:dns';
import { Agent, request as httpsRequest } from 'node:https';
import { BlockList, type LookupFunction } from 'node:net';
import { ApiError } from './errors';
import { LIMITS } from './limits';
import type { Grant } from './sandbox';

// The supervisor's Egress entrypoint sends each fetch an extension makes to
// /egress with these headers. They never go upstream.
export const GRANT_HEADER = 'x-ext-grant';
export const URL_HEADER = 'x-ext-egress-url';
const INTERNAL_HEADERS = [GRANT_HEADER, URL_HEADER, 'x-ext-runtime-token'];

// Meaningful for one connection only, or recomputed for the new one.
const HOP_BY_HOP = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
];

// Everything that isn't a public unicast address: loopback, private,
// link-local (cloud metadata at 169.254.169.254 included), CGNAT, multicast,
// unspecified, documentation and benchmark ranges, and IPv6 forms that embed
// an IPv4 address (NAT64, 6to4). BlockList checks an IPv4-mapped IPv6
// address against the IPv4 ranges itself; a ::ffff:0:0/96 entry here would
// match every IPv4 address too.
const NOT_PUBLIC = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  NOT_PUBLIC.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  NOT_PUBLIC.addSubnet(network, prefix, 'ipv6');
}

const denied = (message: string) => new ApiError(403, 'EGRESS_DENIED', message);

// `*.slack.com` matches a.slack.com and a.b.slack.com, not slack.com.
const allowed = (hosts: string[], hostname: string) =>
  hosts.some((host) =>
    host.startsWith('*.')
      ? hostname.endsWith(host.slice(1))
      : hostname === host,
  );

// The resolver the socket uses. It refuses the name when any address it
// resolves to isn't public, and the socket connects to the address checked
// here, so a second DNS answer can't swap in a private one.
const publicLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { family: options.family, all: true }, (err, addresses) => {
    const blocked = addresses?.some(({ address, family }) =>
      NOT_PUBLIC.check(address, family === 6 ? 'ipv6' : 'ipv4'),
    );

    if (err || blocked || !addresses?.[0]) {
      callback(
        err ??
          Object.assign(
            new Error(`${hostname} resolves to a private address`),
            {
              code: 'EGRESS_PRIVATE',
            },
          ),
        '',
        0,
      );
      return;
    }

    callback(null, addresses[0].address, addresses[0].family);
  });
};

// Without autoSelectFamily, the socket asks publicLookup for one address
// and connects to it; with it, Node would ask for every address and race
// them. No keep-alive, so no socket outlives the request that opened it.
const agent = new Agent({
  autoSelectFamily: false,
  lookup: publicLookup,
  keepAlive: false,
});

const forwardableHeaders = (headers: Headers) => {
  const out: [string, string][] = [];
  const dropped = new Set([
    ...HOP_BY_HOP,
    ...INTERNAL_HEADERS,
    // Headers the Connection header names are hop-by-hop too.
    ...(headers.get('connection') ?? '')
      .split(',')
      .map((name) => name.trim().toLowerCase()),
  ]);

  headers.forEach((value, name) => {
    if (!dropped.has(name)) {
      out.push([name, value]);
    }
  });

  return out;
};

const NULL_BODY_STATUSES = [101, 204, 205, 304];

// One fetch an extension made, sent upstream on the grant's terms: https to
// an allowlisted host on 443, public addresses only, no redirects followed,
// bounded bodies and time, and stopped when the call ends.
export const egress = async (grant: Grant, request: Request) => {
  const target = URL.parse(request.headers.get(URL_HEADER) ?? '');

  if (!target) {
    throw new ApiError(400, 'INVALID_INPUT', 'Not a URL');
  }

  if (target.protocol !== 'https:' || target.port !== '') {
    throw denied(
      `Only https on port 443 is allowed, not ${target.protocol}//${target.host}`,
    );
  }

  if (!allowed(grant.network, target.hostname)) {
    throw denied(
      `${target.hostname} is not in ${grant.extId}'s network allowlist`,
    );
  }

  if (++grant.egressCount > LIMITS.egressPerCall) {
    throw new ApiError(
      429,
      'EGRESS_LIMIT',
      `A call may make at most ${LIMITS.egressPerCall} network requests`,
    );
  }

  const timeoutMs = Math.min(
    LIMITS.egressTimeoutMs,
    grant.deadline - Date.now(),
  );
  const signal = AbortSignal.any([
    grant.abort.signal,
    AbortSignal.timeout(Math.max(timeoutMs, 0)),
  ]);
  const body = Buffer.from(await request.arrayBuffer());

  try {
    const { status, headers, chunks } = await new Promise<{
      status: number;
      headers: Headers;
      chunks: Buffer[];
    }>((resolve, reject) => {
      const req = httpsRequest(
        {
          hostname: target.hostname,
          port: 443,
          path: `${target.pathname}${target.search}`,
          method: request.method,
          headers: {
            ...Object.fromEntries(forwardableHeaders(request.headers)),
            ...(body.length > 0 && { 'content-length': String(body.length) }),
          },
          agent,
          signal,
        },
        (res) => {
          const chunks: Buffer[] = [];
          let size = 0;

          res.on('data', (chunk: Buffer) => {
            size += chunk.length;

            if (size > LIMITS.egressResponseBytes) {
              req.destroy(
                new ApiError(
                  502,
                  'RESPONSE_TOO_LARGE',
                  `${target.hostname} answered with over ${LIMITS.egressResponseBytes} bytes`,
                ),
              );
              return;
            }

            chunks.push(chunk);
          });
          res.on('error', reject);
          res.on('end', () => {
            const headers = new Headers();

            for (const [name, value] of Object.entries(res.headers)) {
              for (const v of [value ?? []].flat()) {
                headers.append(name, v);
              }
            }

            resolve({ status: res.statusCode ?? 502, headers, chunks });
          });
        },
      );

      req.on('error', reject);
      req.end(body);
    });

    return new Response(
      NULL_BODY_STATUSES.includes(status) ? null : Buffer.concat(chunks),
      { status, headers: forwardableHeaders(headers) },
    );
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }

    if (grant.abort.signal.aborted) {
      throw new ApiError(
        403,
        'GRANT_EXPIRED',
        `The call ended before ${target.hostname} answered`,
      );
    }

    if (signal.aborted) {
      throw new ApiError(
        504,
        'EGRESS_TIMEOUT',
        `${target.hostname} didn't answer within ${timeoutMs}ms`,
      );
    }

    if (e instanceof Error && 'code' in e && e.code === 'EGRESS_PRIVATE') {
      throw denied(e.message);
    }

    throw new ApiError(
      502,
      'EGRESS_FAILED',
      `${target.hostname}: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
};
