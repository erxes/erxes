import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

jest.mock('erxes-api-shared/utils/redis', () => ({ redis: {} }));

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/headers'),
  ...jest.requireActual('erxes-api-shared/utils/agent-tools'),
  ...jest.requireActual('erxes-api-shared/utils/trpc/context-header'),
}));

jest.mock('~/apollo-router/paths', () => {
  const dir = jest
    .requireActual<typeof import('fs')>('fs')
    .mkdtempSync(
      jest
        .requireActual<typeof import('path')>('path')
        .join(
          jest.requireActual<typeof import('os')>('os').tmpdir(),
          'router-prod-',
        ),
    );

  return {
    dirTempPath: dir,
    routerConfigPath: `${dir}/router.yaml`,
    routerPath: `${dir}/router`,
    supergraphPath: `${dir}/supergraph.graphql`,
    supergraphConfigPath: `${dir}/supergraph.yaml`,
  };
});

import { routerConfigPath } from '~/apollo-router/paths';

// router.yaml as written by an earlier gateway release, plus a setting an
// operator added by hand.
const PREVIOUS_CONFIG = {
  supergraph: { listen: '127.0.0.1:50000' },
  telemetry: { exporters: { logging: { stdout: { enabled: true } } } },
  headers: { all: { request: [{ propagate: { matching: '.*' } }] } },
};

describe('router config on a production restart', () => {
  const env = { ...process.env };

  afterAll(() => {
    process.env = env;
    fs.rmSync(path.dirname(routerConfigPath), { recursive: true, force: true });
  });

  it('replaces the header rules of an existing router.yaml and keeps the rest', async () => {
    fs.writeFileSync(routerConfigPath, yaml.stringify(PREVIOUS_CONFIG));
    process.env.NODE_ENV = 'production';

    await jest.isolateModulesAsync(async () => {
      const { createRouterConfig } = await import('~/apollo-router');
      await createRouterConfig();
    });

    const written = yaml.parse(fs.readFileSync(routerConfigPath, 'utf8'));
    const rules = written.headers.all.request;

    expect(rules).not.toContainEqual({ propagate: { matching: '.*' } });
    expect(rules).toContainEqual({ propagate: { named: 'user' } });
    expect(rules).toContainEqual({ propagate: { named: 'cookie' } });
    expect(written.telemetry).toEqual(PREVIOUS_CONFIG.telemetry);
    expect(written.supergraph).toEqual(PREVIOUS_CONFIG.supergraph);
  });
});
