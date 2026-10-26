import { ChildProcess, spawn } from 'child_process';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as path from 'path';
import {
  setUserHeader,
  signIdentityHeaders,
} from 'erxes-api-shared/utils/headers';

const SECRET = 'core-identity-secret';
const CORE_ROOT = path.resolve(__dirname, '../..');

const freePort = async () => {
  const probe = http.createServer();
  await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const { port } = probe.address() as AddressInfo;
  await new Promise((resolve) => probe.close(resolve));
  return port;
};

type CoreProcess = {
  child: ChildProcess;
  baseUrl: string;
  output: () => string;
  exited: Promise<number | null>;
};

// Start the real core-api entry point. Redis and MongoDB point at ports
// nothing listens on, so it never reaches a real store or file storage.
const startCore = async (env: Record<string, string>): Promise<CoreProcess> => {
  const port = await freePort();
  const redisPort = await freePort();
  const mongoPort = await freePort();
  let output = '';

  const child = spawn(
    process.execPath,
    [require.resolve('tsx/cli'), 'src/main.ts'],
    {
      cwd: CORE_ROOT,
      env: {
        PATH: process.env.PATH || '',
        HOME: process.env.HOME || '',
        NODE_ENV: 'development',
        PORT: String(port),
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: String(redisPort),
        MONGO_URL: `mongodb://127.0.0.1:${mongoPort}/identity_test?directConnection=true`,
        ...env,
      },
    },
  );
  child.stdout?.on('data', (chunk) => (output += chunk));
  child.stderr?.on('data', (chunk) => (output += chunk));

  const exited = new Promise<number | null>((resolve) =>
    child.on('exit', (code) => resolve(code)),
  );

  return {
    child,
    baseUrl: `http://127.0.0.1:${port}`,
    output: () => output,
    exited,
  };
};

const waitUntilServing = async (core: CoreProcess, timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;
  let stopped = false;
  core.exited.then(() => (stopped = true));

  while (Date.now() < deadline && !stopped) {
    try {
      const res = await fetch(`${core.baseUrl}/health`);
      if (res.ok) {
        return;
      }
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`core-api did not start:\n${core.output().slice(-2000)}`);
};

const stopCore = async (core?: CoreProcess) => {
  if (core && core.child.exitCode === null) {
    core.child.kill('SIGKILL');
    await core.exited;
  }
};

// A refused request answers "forbidden" at once. An accepted one passes the
// login check and then waits on the (unreachable) database, so it is still
// pending when the short deadline passes.
const deleteFile = async (
  core: CoreProcess,
  headers: Record<string, string>,
) => {
  try {
    const res = await fetch(`${core.baseUrl}/delete-file`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ fileName: 'identity-test-file.png' }),
      signal: AbortSignal.timeout(3_000),
    });

    return await res.text();
  } catch (e) {
    if ((e as { name?: string }).name === 'TimeoutError') {
      return 'pending: past the login check';
    }
    throw e;
  }
};

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

// Identity as the gateway forwards it, signed.
const gatewayHeaders = () => {
  const headers: Record<string, string> = { hostname: 'localhost' };
  const previous = process.env.JWT_TOKEN_SECRET;
  process.env.JWT_TOKEN_SECRET = SECRET;
  setUserHeader(headers, { _id: 'staff-1', email: 'staff@example.com' });
  headers['x-erxes-identity-signature'] = signIdentityHeaders(headers) || '';
  process.env.JWT_TOKEN_SECRET = previous;
  return headers;
};

const unsignedHeaders = () => ({
  hostname: 'localhost',
  user: encode({ _id: 'spoofed-user' }),
  userid: 'spoofed-user',
});

describe('core-api /delete-file identity', () => {
  describe('INTERNAL_HEADER_SIGNATURE=enforce', () => {
    let core: CoreProcess;

    beforeAll(async () => {
      core = await startCore({
        INTERNAL_HEADER_SIGNATURE: 'enforce',
        JWT_TOKEN_SECRET: SECRET,
      });
      await waitUntilServing(core);
    }, 90_000);

    afterAll(() => stopCore(core));

    it('refuses an unsigned userid', async () => {
      expect(await deleteFile(core, unsignedHeaders())).toBe('forbidden');
    });

    it('refuses a userid changed after the gateway signed it', async () => {
      expect(
        await deleteFile(core, { ...gatewayHeaders(), userid: 'staff-9' }),
      ).toBe('forbidden');
    });

    it('lets a gateway-signed userid past the login check', async () => {
      expect(await deleteFile(core, gatewayHeaders())).not.toBe('forbidden');
    }, 30_000);
  });

  describe('INTERNAL_HEADER_SIGNATURE=report (default)', () => {
    let core: CoreProcess;

    beforeAll(async () => {
      core = await startCore({ JWT_TOKEN_SECRET: SECRET });
      await waitUntilServing(core);
    }, 90_000);

    afterAll(() => stopCore(core));

    it('still accepts an unsigned userid, and logs it', async () => {
      expect(await deleteFile(core, unsignedHeaders())).not.toBe('forbidden');
      expect(core.output()).toContain(
        '[internal-header-signature] Accepted an internal identity header although its signature is missing',
      );
    }, 30_000);
  });
});

describe('core-api startup', () => {
  let core: CoreProcess | undefined;

  afterEach(() => stopCore(core));

  it('refuses to start with INTERNAL_HEADER_SIGNATURE=enforce and no JWT_TOKEN_SECRET', async () => {
    core = await startCore({ INTERNAL_HEADER_SIGNATURE: 'enforce' });

    const code = await Promise.race([
      core.exited,
      new Promise<'still running'>((resolve) =>
        setTimeout(() => resolve('still running'), 45_000),
      ),
    ]);

    expect(core.output()).toContain(
      'INTERNAL_HEADER_SIGNATURE=enforce requires JWT_TOKEN_SECRET',
    );
    expect(code).toBe(1);
  }, 60_000);
});
