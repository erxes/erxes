import { once } from 'node:events';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { z } from 'zod';
import { afterAll, beforeAll } from 'vite-plus/test';
import { config } from '~/config';

const Body = z.record(z.string(), z.unknown());

const readBody = async (req: IncomingMessage) => {
  let raw = '';

  for await (const chunk of req) raw += String(chunk);

  return raw ? Body.parse(JSON.parse(raw)) : {};
};

const answer = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

/**
 * A merchant's PosAPI and the tax office's lookup on one local server, for
 * the file's tests: `fake` is what PosAPI received (and `refuse` makes it
 * refuse receipts), `settings()` eBarimt settings that point at it.
 * The tax office knows one company, registration 1234567.
 */
export const usePosApi = () => {
  const fake = {
    puts: [] as Record<string, unknown>[],
    deletes: [] as Record<string, unknown>[],
    refuse: null as string | null,
    bills: 0,
  };

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://local');

    if (url.pathname === '/posapi/rest/info')
      return answer(res, 200, { version: '3.0', merchants: [] });

    if (url.pathname === '/posapi/rest/receipt' && req.method === 'POST') {
      fake.puts.push(await readBody(req));

      if (fake.refuse) return answer(res, 200, { status: 'ERROR', message: fake.refuse });

      fake.bills += 1;

      return answer(res, 200, {
        status: 'SUCCESS',
        id: `BILL${fake.bills}`,
        date: '2026-11-17 10:00:00',
        lottery: `LT${fake.bills}`,
        qrData: `QR${fake.bills}`,
      });
    }

    if (url.pathname === '/posapi/rest/receipt' && req.method === 'DELETE') {
      fake.deletes.push(await readBody(req));

      return answer(res, 200, {});
    }

    if (url.pathname === '/tax/getTinInfo') {
      return url.searchParams.get('regNo') === '1234567'
        ? answer(res, 200, { status: 200, data: '12345678901' })
        : answer(res, 200, { status: 400, data: null });
    }

    if (url.pathname === '/tax/getInfo')
      return answer(res, 200, { status: 200, data: { name: 'Acme LLC' } });

    return answer(res, 404, {});
  };

  const server = createServer((req, res) => {
    void handle(req, res);
  });

  let base = '';

  beforeAll(async () => {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const address = server.address();

    base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
    config.ebarimt.taxpayerUrl = `${base}/tax`;
  });

  afterAll(() => server.close());

  return {
    fake,
    base: () => base,
    settings: () => ({
      posApiUrl: `${base}/posapi`,
      companyName: 'Acme Shop',
      merchantTin: '37900846788',
      districtCode: '3505',
      posNo: '10001',
    }),
  };
};
