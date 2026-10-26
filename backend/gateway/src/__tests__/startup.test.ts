import { spawn } from 'child_process';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as path from 'path';

const freePort = async () => {
  const probe = http.createServer();
  await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const { port } = probe.address() as AddressInfo;
  await new Promise((resolve) => probe.close(resolve));
  return port;
};

// Start the real gateway entry point and wait for it to exit (or give up).
const runGateway = async (env: Record<string, string>, timeoutMs: number) => {
  const [port, routerPort, redisPort] = [
    await freePort(),
    await freePort(),
    // Nothing listens here, so the gateway never reaches a real Redis.
    await freePort(),
  ];

  return new Promise<{ code: number | null; output: string }>((resolve) => {
    const child = spawn(
      process.execPath,
      [require.resolve('ts-node/dist/bin'), 'src/main.ts'],
      {
        cwd: path.resolve(__dirname, '../..'),
        env: {
          PATH: process.env.PATH || '',
          HOME: process.env.HOME || '',
          NODE_ENV: 'development',
          TS_NODE_TRANSPILE_ONLY: 'true',
          PORT: String(port),
          APOLLO_ROUTER_PORT: String(routerPort),
          REDIS_HOST: '127.0.0.1',
          REDIS_PORT: String(redisPort),
          // Defined (even empty) so a local .env cannot supply them: dotenv
          // never overrides a variable that is already set.
          JWT_TOKEN_SECRET: '',
          INTERNAL_HEADER_SIGNATURE: '',
          ...env,
        },
      },
    );
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));

    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('exit', (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
};

describe('gateway startup', () => {
  it('refuses to start with INTERNAL_HEADER_SIGNATURE=enforce and no JWT_TOKEN_SECRET', async () => {
    const { code, output } = await runGateway(
      { INTERNAL_HEADER_SIGNATURE: 'enforce', JWT_TOKEN_SECRET: '' },
      45_000,
    );

    expect(output).toContain(
      'INTERNAL_HEADER_SIGNATURE=enforce requires JWT_TOKEN_SECRET',
    );
    expect(code).toBe(1);
  }, 60_000);

  it('refuses to start with an unrecognised INTERNAL_HEADER_SIGNATURE value', async () => {
    const { code, output } = await runGateway(
      { INTERNAL_HEADER_SIGNATURE: 'enfroce', JWT_TOKEN_SECRET: 'secret' },
      45_000,
    );

    expect(output).toContain(
      'INTERNAL_HEADER_SIGNATURE must be "report" or "enforce", got "enfroce"',
    );
    expect(code).toBe(1);
  }, 60_000);
});
