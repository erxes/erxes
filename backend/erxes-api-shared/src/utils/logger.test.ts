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
    expect(maskLogLine('mongodb://erxes:s3cret@10.0.3.3:27017/erxes')).toBe(
      'mongodb://erxes:***@10.0.3.3:27017/erxes',
    );
    expect(maskLogLine('mongodb://erxes:@dmin17@dmin17@10.0.3.3/erxes')).toBe(
      'mongodb://erxes:***@10.0.3.3/erxes',
    );
    expect(maskLogLine('amqp://guest:p@ss:w0rd@rabbit:5672')).toBe(
      'amqp://guest:***@rabbit:5672',
    );
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
    const line = '{"msg":"db mongodb://u:p@h/db","email":"a@b.mn"}';
    const masked = maskLogLine(line);
    expect(JSON.parse(masked)).toEqual({
      msg: 'db mongodb://u:***@h/db',
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
    const url = 'mongodb://erxes:TopSecret@db:27017/erxes';

    log.info(`connecting to ${url}`);
    log.info({ mongoUrl: url }, 'config');
    log.error({ err: new Error(`failed to connect ${url}`) }, 'startup failed');

    expect(raw.join('\n')).not.toContain('TopSecret');
    expect(raw.join('\n')).toContain('mongodb://erxes:***@db:27017/erxes');
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

  it('keeps a well-formed incoming id', () => {
    expect(getRequestId(req({ 'x-request-id': 'abc-123.x:y' }))).toBe(
      'abc-123.x:y',
    );
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
    app.get('/hang', () => undefined);

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
      expect(fresh.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);

      const given = await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: { 'x-request-id': 'gw-42' },
      });
      expect(given.headers.get('x-request-id')).toBe('gw-42');
    } finally {
      await stop(server);
    }
  });

  it('by default logs failures and slow requests, not fast successful ones', async () => {
    const { lines, base, server } = await start();
    try {
      await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-request-id': 'gw-7' },
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
          'x-request-id': 'gw-9',
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
      const controller = new AbortController();
      const pending = fetch(`${base}/hang`, {
        signal: controller.signal,
      }).catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));
      controller.abort();
      await pending;
      await new Promise((resolve) => setTimeout(resolve, 100));

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
      expect(res.headers.get('x-request-id')).toBeTruthy();
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
      throw new Error('boom at mongodb://erxes:TopSecret@db:27017/erxes');
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
        headers: { 'x-request-id': 'gw-err' },
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
      expect(raw.join('\n')).not.toContain('TopSecret');
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
