// namespace import: the spec tsconfig has esModuleInterop off and express has no `default` export
import * as express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Writable } from 'stream';
import {
  createLogger,
  errorLogger,
  getRequestId,
  maskLogLine,
  requestLogger,
  RequestLogMode,
} from './logger';

// Fake connection strings, assembled at runtime so secret scanners don't flag this file; passwords are fake.
const conn = (scheme: string, user: string, pass: string, rest: string) =>
  `${scheme}://${user}:${pass}@${rest}`;

const capture = () => {
  const lines: any[] = [];
  const raw: string[] = [];
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        raw.push(line);
        lines.push(JSON.parse(line));
      }
      callback();
    },
  });

  return { lines, raw, destination };
};

describe('maskLogLine', () => {
  it('masks credentials in connection strings, also when the password contains @', () => {
    expect(
      maskLogLine(
        conn('mongodb', 'erxes', 'fake-pass', '10.0.3.3:27017/erxes'),
      ),
    ).toBe(conn('mongodb', 'erxes', '***', '10.0.3.3:27017/erxes'));
    expect(
      maskLogLine(
        conn('mongodb', 'erxes', '@fake@pass@word', '10.0.3.3/erxes'),
      ),
    ).toBe(conn('mongodb', 'erxes', '***', '10.0.3.3/erxes'));
    expect(
      maskLogLine(conn('amqp', 'guest', 'fake@pa:ss', 'rabbit:5672')),
    ).toBe(conn('amqp', 'guest', '***', 'rabbit:5672'));
  });

  it('masks http and https URLs with credentials too', () => {
    expect(
      maskLogLine(conn('http', 'user', 'fake-pass', 'proxy.local:3128')),
    ).toBe(conn('http', 'user', '***', 'proxy.local:3128'));
    expect(
      maskLogLine(conn('https', 'user', 'fake-pass', 'api.example/x')),
    ).toBe(conn('https', 'user', '***', 'api.example/x'));
  });

  it('leaves URLs without credentials alone', () => {
    const text = 'mongodb://10.0.3.3:27017/erxes and https://erxes.io/docs';
    expect(maskLogLine(text)).toBe(text);
  });

  it('masks Bearer tokens', () => {
    expect(
      maskLogLine('authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def'),
    ).toBe('authorization: Bearer ***');
  });

  it('never runs across JSON fields', () => {
    const line = `{"msg":"db ${conn(
      'mongodb',
      'u',
      'p',
      'h/db',
    )}","email":"a@b.mn"}`;
    const masked = maskLogLine(line);
    expect(JSON.parse(masked)).toEqual({
      msg: `db ${conn('mongodb', 'u', '***', 'h/db')}`,
      email: 'a@b.mn',
    });
  });
});

describe('createLogger', () => {
  it('writes one JSON line with string level, ISO time, service and message', () => {
    const { lines, destination } = capture();
    const log = createLogger({ service: 'sales', destination });

    log.info({ dealId: 'd1' }, 'deal moved');

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      level: 'info',
      service: 'sales',
      dealId: 'd1',
      msg: 'deal moved',
    });
    expect(new Date(lines[0].time).toISOString()).toBe(lines[0].time);
  });

  it('masks secrets in the message, in fields and in error messages and stacks', () => {
    const { raw, destination } = capture();
    const log = createLogger({ service: 'core', destination });
    const url = conn('mongodb', 'erxes', 'FakeTopSecret', 'db:27017/erxes');

    log.info(`connecting to ${url}`);
    log.info({ mongoUrl: url }, 'config');
    log.error({ err: new Error(`failed to connect ${url}`) }, 'startup failed');

    expect(raw.join('\n')).not.toContain('FakeTopSecret');
    expect(raw.join('\n')).toContain(
      conn('mongodb', 'erxes', '***', 'db:27017/erxes'),
    );
  });

  it('redacts well-known secret keys at any of the first three levels', () => {
    const { lines, destination } = capture();
    const log = createLogger({ destination });

    log.info({
      password: 'p1',
      user: { token: 't1', name: 'Bat' },
      req: {
        headers: {
          authorization: 'Basic x',
          cookie: 'auth-token=y',
          host: 'erxes.mn',
        },
      },
    });

    expect(lines[0].password).toBe('[Redacted]');
    expect(lines[0].user).toEqual({ token: '[Redacted]', name: 'Bat' });
    expect(lines[0].req.headers).toEqual({
      authorization: '[Redacted]',
      cookie: '[Redacted]',
      host: 'erxes.mn',
    });
  });

  it('serializes errors with type, message and stack', () => {
    const { lines, destination } = capture();
    const log = createLogger({ destination });

    log.error({ err: new TypeError('boom') }, 'handler failed');

    expect(lines[0]).toMatchObject({ level: 'error', msg: 'handler failed' });
    expect(lines[0].err).toMatchObject({ type: 'TypeError', message: 'boom' });
    expect(lines[0].err.stack).toContain('TypeError: boom');
  });

  it('respects the level threshold', () => {
    const { lines, destination } = capture();
    const log = createLogger({ level: 'warn', destination });

    log.info('hidden');
    log.warn('shown');

    expect(lines.map((line) => line.msg)).toEqual(['shown']);
  });
});

describe('getRequestId', () => {
  const req = (headers: Record<string, any>) => ({ headers } as any);

  it('keeps a well-formed incoming id: ours first, then a client x-request-id', () => {
    expect(getRequestId(req({ 'x-erxes-request-id': 'abc-123.x:y' }))).toBe(
      'abc-123.x:y',
    );
    expect(getRequestId(req({ 'x-request-id': 'client-1' }))).toBe('client-1');
    expect(
      getRequestId(
        req({ 'x-erxes-request-id': 'gw-1', 'x-request-id': 'client-1' }),
      ),
    ).toBe('gw-1');
  });

  it('replaces a missing, oversized or unsafe id with a new uuid', () => {
    for (const value of [
      undefined,
      '',
      'a'.repeat(200),
      'bad id\n{"level":"error"}',
    ]) {
      expect(getRequestId(req({ 'x-request-id': value }))).toMatch(
        /^[0-9a-f-]{36}$/,
      );
    }
  });
});

describe('requestLogger', () => {
  let hangReceived: () => void = () => undefined;
  // generous margins (slow = 300 ms, slow route 400 ms) so a busy CI runner cannot flip the result
  const start = async (mode?: RequestLogMode) => {
    const { lines, destination } = capture();
    const log = createLogger({ service: 'sales', destination });
    const app = express();

    app.use(express.json());
    app.use(requestLogger({ log, mode, slowMs: 300 }));
    app.get('/health', (_req, res) => res.end('ok'));
    app.post('/graphql', (_req, res) => res.json({ data: {} }));
    app.get('/fail', (_req, res) => res.status(500).end());
    app.get('/slow', (_req, res) => setTimeout(() => res.end('late'), 400));
    app.get('/hang', () => hangReceived());
    app.get('/echo', (req, res) =>
      res.json({ xRequestId: req.headers['x-request-id'] ?? null }),
    );

    const server = http.createServer(app);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    return { lines, base, server };
  };

  const stop = (server: http.Server) =>
    new Promise<void>((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    });

  it('returns a request id and reuses the one it was given', async () => {
    const { base, server } = await start();
    try {
      const fresh = await fetch(`${base}/graphql`, { method: 'POST' });
      expect(fresh.headers.get('x-erxes-request-id')).toMatch(
        /^[0-9a-f-]{36}$/,
      );

      const given = await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: { 'x-erxes-request-id': 'gw-42' },
      });
      expect(given.headers.get('x-erxes-request-id')).toBe('gw-42');
    } finally {
      await stop(server);
    }
  });

  it('never adds or changes x-request-id (webhooks use it as an idempotency key)', async () => {
    const { base, server } = await start();
    try {
      const none = await fetch(`${base}/echo`);
      expect(await none.json()).toEqual({ xRequestId: null });
      expect(none.headers.get('x-request-id')).toBeNull();

      const sent = await fetch(`${base}/echo`, {
        headers: { 'x-request-id': 'sender-event-7' },
      });
      expect(await sent.json()).toEqual({ xRequestId: 'sender-event-7' });
    } finally {
      await stop(server);
    }
  });

  it('by default logs failures and slow requests, not fast successful ones', async () => {
    const { lines, base, server } = await start();
    try {
      await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-erxes-request-id': 'gw-7',
        },
        body: JSON.stringify({
          operationName: 'deals',
          query: '{ deals { _id } }',
        }),
      });
      await fetch(`${base}/fail?token=abc`);
      await fetch(`${base}/slow`);
      await fetch(`${base}/health`);

      expect(lines.map((line) => line.path)).toEqual(['/fail', '/slow']);
      expect(lines[0]).toMatchObject({
        level: 'error',
        status: 500,
        method: 'GET',
        msg: 'request',
      });
      expect(lines[1]).toMatchObject({ level: 'warn', status: 200 });
      expect(lines[1].durationMs).toBeGreaterThanOrEqual(300);
      expect(JSON.stringify(lines)).not.toContain('token=abc');
    } finally {
      await stop(server);
    }
  });

  it('mode "all" logs every request with its GraphQL operation and request id', async () => {
    const { lines, base, server } = await start('all');
    try {
      await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-erxes-request-id': 'gw-9',
          userid: 'u1',
          'x-erxes-process-id': 'proc-1',
        },
        body: JSON.stringify({
          operationName: 'deals',
          query: '{ deals { _id } }',
        }),
      });

      expect(lines).toHaveLength(1);
      expect(lines[0]).toMatchObject({
        level: 'info',
        service: 'sales',
        requestId: 'gw-9',
        operation: 'deals',
        userId: 'u1',
        processId: 'proc-1',
        status: 200,
      });
    } finally {
      await stop(server);
    }
  });

  it('logs a request the client gave up on as aborted', async () => {
    const { lines, base, server } = await start();
    try {
      const received = new Promise<void>((resolve) => {
        hangReceived = resolve;
      });
      const controller = new AbortController();
      const pending = fetch(`${base}/hang`, {
        signal: controller.signal,
      }).catch(() => undefined);
      await received;
      controller.abort();
      await pending;
      for (let i = 0; i < 50 && lines.length === 0; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      expect(lines).toHaveLength(1);
      expect(lines[0]).toMatchObject({
        level: 'warn',
        msg: 'request aborted by client',
        path: '/hang',
      });
      expect(lines[0].status).toBeUndefined();
    } finally {
      await stop(server);
    }
  });

  it('mode "off" logs nothing but still sets the request id', async () => {
    const { lines, base, server } = await start('off');
    try {
      const res = await fetch(`${base}/fail`);
      expect(res.headers.get('x-erxes-request-id')).toBeTruthy();
      expect(lines).toHaveLength(0);
    } finally {
      await stop(server);
    }
  });
});

describe('errorLogger', () => {
  const start = async () => {
    const { lines, raw, destination } = capture();
    const log = createLogger({ service: 'sales', destination });
    const app = express();

    app.use(requestLogger({ log, mode: 'off' }));
    app.get('/boom', () => {
      throw new Error(
        `boom at ${conn(
          'mongodb',
          'erxes',
          'FakeTopSecret',
          'db:27017/erxes',
        )}`,
      );
    });
    app.get('/missing', (_req, _res, next) =>
      next(Object.assign(new Error('no such deal'), { status: 404 })),
    );
    app.get('/odd', (_req, _res, next) =>
      next(Object.assign(new Error('odd status'), { status: 200 })),
    );
    app.get('/late', (_req, res, next) => {
      res.write('partial');
      next(new Error('failed after the headers were sent'));
    });
    app.use(errorLogger({ log }));

    const server = http.createServer(app);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    return { lines, raw, base, server };
  };

  const stop = (server: http.Server) =>
    new Promise<void>((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    });

  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });
  afterEach(() => consoleError.mockRestore());

  it('turns a thrown error into one masked JSON line and a plain 500', async () => {
    const { lines, raw, base, server } = await start();
    try {
      const res = await fetch(`${base}/boom?token=abc`, {
        headers: { 'x-erxes-request-id': 'gw-err' },
      });

      expect(res.status).toBe(500);
      expect(await res.text()).toBe('Internal Server Error');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toMatchObject({
        level: 'error',
        msg: 'unhandled error',
        requestId: 'gw-err',
        path: '/boom',
        status: 500,
      });
      expect(lines[0].err.stack).toContain('Error: boom at');
      expect(raw.join('\n')).not.toContain('FakeTopSecret');
      expect(raw.join('\n')).not.toContain('token=abc');
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      await stop(server);
    }
  });

  it('keeps a 4xx status from the error and logs it as a warning', async () => {
    const { lines, base, server } = await start();
    try {
      const res = await fetch(`${base}/missing`);

      expect(res.status).toBe(404);
      expect(await res.text()).toBe('Not Found');
      expect(lines[0]).toMatchObject({ level: 'warn', status: 404 });
    } finally {
      await stop(server);
    }
  });

  it('answers 500 when the error carries a status that is not an error', async () => {
    const { lines, base, server } = await start();
    try {
      expect((await fetch(`${base}/odd`)).status).toBe(500);
      expect(lines[0]).toMatchObject({ level: 'error', status: 500 });
    } finally {
      await stop(server);
    }
  });

  it('closes the connection when the response had already started', async () => {
    const { lines, base, server } = await start();
    try {
      const body = await fetch(`${base}/late`)
        .then((res) => res.text())
        .catch((e: Error) => `failed: ${e.message}`);

      expect(body).not.toBe('Internal Server Error');
      expect(lines[0]).toMatchObject({ level: 'error', path: '/late' });
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      await stop(server);
    }
  });
});
