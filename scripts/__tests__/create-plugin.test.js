const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync, spawnSync } = require('node:child_process');
const { PassThrough } = require('node:stream');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToPipeableStream } = require('react-dom/server');
const { StaticRouter, Routes, Route, Link } = require('react-router');
const { graphql } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const root = path.resolve(__dirname, '../..');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'erxes-generator-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.join(directory, 'scripts'));
  for (const name of [
    'create-plugin.js',
    'create-backend-plugin.js',
    'plugin-ports.js',
  ]) {
    fs.copyFileSync(
      path.join(root, 'scripts', name),
      path.join(directory, 'scripts', name),
    );
  }
  fs.symlinkSync(
    path.join(root, 'node_modules'),
    path.join(directory, 'node_modules'),
    'dir',
  );
  return directory;
}

function generate(
  directory,
  plugin = 'inventory',
  module = 'items',
  flags = [],
) {
  return execFileSync(
    process.execPath,
    [
      path.join(directory, 'scripts/create-plugin.js'),
      `--plugin-name=${plugin}`,
      `--module-name=${module}`,
      ...flags,
    ],
    { cwd: directory, encoding: 'utf8' },
  );
}

// Execute the generated modules, with only platform boundaries substituted.
// Check directory entries explicitly so this also detects casing bugs on macOS.
function sourceLoader(sourceRoot, stubs = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      fileName: filename,
      reportDiagnostics: true,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    assert.deepEqual(output.diagnostics, [], filename);
    const mod = { exports: {} };
    cache.set(filename, mod);
    const localRequire = (specifier) => {
      if (specifier in stubs) return stubs[specifier];
      let base;
      if (specifier.startsWith('~/'))
        base = path.join(sourceRoot, specifier.slice(2));
      else if (specifier.startsWith('@/'))
        base = path.join(sourceRoot, 'modules', specifier.slice(2));
      else if (specifier.startsWith('.'))
        base = path.resolve(path.dirname(filename), specifier);
      else return require(specifier);
      const resolved = [
        base,
        `${base}.ts`,
        `${base}.tsx`,
        path.join(base, 'index.ts'),
      ].find(
        (candidate) =>
          fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      assert.ok(resolved, `Missing import ${specifier} in ${filename}`);
      let current = path.parse(resolved).root;
      for (const part of resolved.slice(current.length).split(path.sep)) {
        assert.ok(
          fs.readdirSync(current).includes(part),
          `Case-sensitive import: ${resolved}`,
        );
        current = path.join(current, part);
      }
      return load(resolved);
    };
    vm.runInThisContext(
      `(function(require, module, exports) {${output.outputText}\n})`,
      { filename },
    )(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

const element = React.createElement;
const Box = ({ children }) => element('div', null, children);
const NavigationLink = ({ path: target, pathPrefix, name }) =>
  element(
    Link,
    { to: `/${pathPrefix ? `${pathPrefix}/` : ''}${target}` },
    name,
  );
const ui = {
  AppLayout: ({ id, sidebar, footer, children }) =>
    element('main', { 'data-app': id }, sidebar, children, footer),
  AppLayoutFooterLink: NavigationLink,
  NavigationMenuLinkItem: NavigationLink,
  Sidebar: { Group: Box, GroupLabel: Box, GroupContent: Box, Menu: Box },
  Spinner: () => element('span', null, 'Loading'),
  Button: Box,
  Breadcrumb: Object.assign(({ children }) => element('div', null, children), {
    List: Box,
    Item: Box,
  }),
  Separator: { Inline: Box },
};
const PageHeader = Object.assign(Box, {
  Start: Box,
  End: Box,
  FavoriteToggleButton: Box,
});

function render(tree) {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = '';
    output.on('data', (chunk) => {
      html += chunk;
    });
    output.on('end', () => resolve(html));
    const stream = renderToPipeableStream(tree, {
      onAllReady: () => stream.pipe(output),
      onError: reject,
    });
  });
}

test('generated app exposes, navigation and nested settings work with named exports', async (t) => {
  for (const [plugin, publicName, pascal, module, modulePath] of [
    ['inventory', 'inventory', 'Inventory', 'items', 'items'],
    [
      'inventoryTools',
      'inventory-tools',
      'InventoryTools',
      'stockItems',
      'stock-items',
    ],
  ]) {
    const directory = fixture(t);
    generate(directory, plugin, module);
    const pluginRoot = path.join(
      directory,
      `frontend/plugins/${publicName}_ui`,
    );
    const src = path.join(pluginRoot, 'src');
    const load = sourceLoader(src, {
      'erxes-ui': ui,
      'ui-modules': {
        PageHeader,
        PluginSettingsRoutes: Box,
        PluginSharedSettingsNavigation: () => null,
      },
    });
    const { CONFIG } = load(path.join(src, 'config.tsx'));
    assert.equal(CONFIG.name, publicName);
    assert.equal(
      CONFIG.navigationGroup.defaultPath,
      `${publicName}/${modulePath}`,
    );
    assert.equal(CONFIG.modules[0].path, `${publicName}/${modulePath}`);
    assert.equal(CONFIG.settingsNavigation, undefined);
    assert.equal(CONFIG.navigationGroup.content, undefined);

    const { config } = load(
      path.join(pluginRoot, 'module-federation.config.ts'),
    );
    assert.ok(config.exposes[`./${CONFIG.name}`]);
    for (const [expose, filename] of Object.entries(config.exposes)) {
      const exports = load(path.join(pluginRoot, filename));
      assert.equal(
        'default' in exports,
        false,
        `Named application exports: ${expose}`,
      );
      assert.ok(Object.keys(exports).length > 0);
    }
    const Main = load(path.join(src, 'modules', `${pascal}Main.tsx`))[
      `${pascal}Main`
    ];
    const page = await render(
      element(
        StaticRouter,
        { location: `/${publicName}/${modulePath}` },
        element(
          Routes,
          null,
          element(Route, { path: `/${publicName}/*`, element: element(Main) }),
        ),
      ),
    );
    assert.match(page, new RegExp(`data-app="${publicName}"`));
    assert.ok(page.includes(`href="/${publicName}/${modulePath}"`));
    assert.ok(page.includes(`href="/${publicName}/settings/${modulePath}"`));
    const settings = await render(
      element(
        StaticRouter,
        { location: `/${publicName}/settings/${modulePath}` },
        element(
          Routes,
          null,
          element(Route, { path: `/${publicName}/*`, element: element(Main) }),
        ),
      ),
    );
    assert.match(settings, new RegExp(`data-app="${publicName}:settings"`));
    assert.ok(settings.includes(`${module} Settings`));
    assert.ok(
      settings.includes(`href="/${publicName}/settings/${modulePath}"`),
    );
    assert.equal(settings.includes('href="/settings/'), false);
  }
});

test('generated backend imports work case-sensitively and GraphQL uses tenant context', async (t) => {
  const directory = fixture(t);
  generate(directory);
  const src = path.join(directory, 'backend/plugins/inventory_api/src');
  const load = sourceLoader(src, {
    'erxes-api-shared/utils': {
      createGenerateModels: (loadClasses) => loadClasses,
      mongooseStringRandomId: { type: String },
    },
  });
  const { loadClasses } = load(path.join(src, 'connectionResolvers.ts'));
  const registrations = [];
  const models = loadClasses({
    model: (name, schema) => {
      registrations.push({ name, schema });
      return {};
    },
  });
  assert.ok(models.Items);
  assert.equal(registrations[0].name, 'items');
  assert.equal(typeof registrations[0].schema.statics.getItemss, 'function');
  const { queries } = load(path.join(src, 'apollo/resolvers/queries.ts'));
  const schemaParts = load(path.join(src, 'apollo/schema/schema.ts'));
  const schema = makeExecutableSchema({
    typeDefs: `${schemaParts.types} type Query { ${schemaParts.queries} }`,
    resolvers: { Query: queries },
  });
  for (const tenant of ['first', 'second']) {
    const records = [{ _id: tenant, name: `${tenant} item` }];
    const result = await graphql({
      schema,
      source:
        'query InventoryList { getItemss { _id name } getItems(_id: "one") { _id } }',
      contextValue: {
        models: {
          Items: {
            getItemss: async () => records,
            getItems: async () => records[0],
          },
        },
      },
    });
    assert.equal(result.errors, undefined);
    assert.equal(result.data.getItemss[0]._id, tenant);
    assert.equal(result.data.getItems._id, tenant);
  }
});

test('ports are allocated without configured collisions and flags are respected', (t) => {
  const directory = fixture(t);
  generate(directory);
  generate(directory, 'inventoryTools', 'items');
  const uiProject = (name) =>
    JSON.parse(
      fs.readFileSync(
        path.join(directory, `frontend/plugins/${name}_ui/project.json`),
        'utf8',
      ),
    );
  const apiPort = (name) =>
    Number(
      fs
        .readFileSync(
          path.join(directory, `backend/plugins/${name}_api/src/main.ts`),
          'utf8',
        )
        .match(/port:\s*(\d+)/)[1],
    );
  const ports = [
    uiProject('inventory').targets.serve.options.port,
    uiProject('inventory-tools').targets.serve.options.port,
    apiPort('inventory'),
    apiPort('inventory-tools'),
  ];
  assert.equal(new Set(ports).size, 4);
  generate(directory, 'custom', 'items', [
    '--ui-port',
    '3200',
    '--api-port=3400',
  ]);
  assert.equal(uiProject('custom').targets.serve.options.port, 3200);
  assert.equal(apiPort('custom'), 3400);
  for (const flags of [
    ['--ui-port=3200'],
    ['--api-port=3400'],
    ['--ui-port=wat'],
    ['--api-port=65536'],
  ]) {
    const result = spawnSync(process.execPath, [
      path.join(directory, 'scripts/create-plugin.js'),
      '-p',
      'invalid',
      '-m',
      'items',
      ...flags,
    ]);
    assert.notEqual(result.status, 0);
    assert.equal(
      fs.existsSync(path.join(directory, 'frontend/plugins/invalid_ui')),
      false,
    );
  }
  const original = fs.readFileSync(
    path.join(directory, 'frontend/plugins/inventory_ui/src/config.tsx'),
    'utf8',
  );
  assert.throws(() => generate(directory), /already exists/);
  assert.equal(
    fs.readFileSync(
      path.join(directory, 'frontend/plugins/inventory_ui/src/config.tsx'),
      'utf8',
    ),
    original,
  );
});

test('logs and automations ports cannot be assigned to generated APIs or UIs', (t) => {
  const directory = fixture(t);
  for (const port of [3301, 3302]) {
    for (const layer of ['api', 'ui']) {
      const result = spawnSync(
        process.execPath,
        [
          path.join(directory, 'scripts/create-plugin.js'),
          '--plugin-name=collision',
          '--module-name=items',
          `--${layer}-port=${port}`,
        ],
        { encoding: 'utf8' },
      );
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        new RegExp(`port ${port} is already configured`),
      );
      for (const [side, suffix] of [
        ['frontend', 'ui'],
        ['backend', 'api'],
      ]) {
        assert.equal(
          fs.existsSync(
            path.join(directory, side, 'plugins', `collision_${suffix}`),
          ),
          false,
        );
      }
    }
  }
});

test('core discovery normalizes only remote containers, preserving public lookup and entry paths', async () => {
  for (const version of ['os', 'saas']) {
    const lookups = [];
    const load = sourceLoader(path.join(root, 'backend/core-api/src'), {
      'erxes-api-shared/utils': {
        getEnv: ({ name }) =>
          name === 'VERSION' ? version : 'inventory,inventory-tools',
        getPlugin: async (name) => {
          lookups.push(name);
          return {
            config:
              name === 'inventory'
                ? { uiEntry: 'https://inventory.example/remoteEntry.js' }
                : { releaseVersion: '3.3.2' },
          };
        },
        getSubdomain: () => 'test',
        getSaasOrganizationDetail: async () => ({
          charge: {
            inventory: { purchased: 1 },
            'inventory-tools': { free: 1 },
          },
        }),
        isGlobalProfileV2: () => false,
      },
      '~/connectionResolvers': {},
      '~/utils/saas': {
        handleCoreLogin: () => null,
        magiclinkCallback: () => null,
        ssocallback: () => null,
      },
    });
    const { router } = load(
      path.join(root, 'backend/core-api/src/modules/organization/routes.ts'),
    );
    const route = router.stack.find(
      (layer) => layer.route?.path === '/get-frontend-plugins',
    ).route;
    let response;
    await route.stack[0].handle(
      {},
      {
        json: (data) => {
          response = data;
        },
      },
    );
    assert.deepEqual(response.slice(0, 2), [
      {
        name: 'inventory_ui',
        entry: 'https://inventory.example/remoteEntry.js',
      },
      {
        name: 'inventory_tools_ui',
        entry:
          'https://plugins.erxes.io/3.3.2/inventory-tools_ui/remoteEntry.js',
      },
    ]);
    assert.deepEqual(lookups.slice(0, 2), ['inventory', 'inventory-tools']);
  }
});
