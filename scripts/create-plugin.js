const fs = require('fs');
const path = require('path');
const { prompt } = require('enquirer');
const { createBackendPlugin } = require('./create-backend-plugin');

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: pnpm create-plugin [options]

Options:
  --plugin-name, -p    Plugin name (e.g., inventory, analytics)
  --module-name, -m    Module name (e.g., items, reports)
  --help, -h          Show this help message

Examples:
  pnpm create-plugin
  pnpm create-plugin --plugin-name=inventory --module-name=items
  pnpm create-plugin -p inventory -m items
      `);
      process.exit(0);
    } else if (arg.startsWith('--plugin-name=')) {
      flags.pluginName = arg.split('=')[1];
    } else if (arg.startsWith('--module-name=')) {
      flags.moduleName = arg.split('=')[1];
    } else if ((arg === '--plugin-name' || arg === '-p') && args[i + 1]) {
      flags.pluginName = args[++i];
    } else if ((arg === '--module-name' || arg === '-m') && args[i + 1]) {
      flags.moduleName = args[++i];
    }
  }

  return flags;
}

function validateName(name, type) {
  if (!name) return `${type} name is required`;
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
    return `${type} name must start with a letter and contain only letters and numbers`;
  }
  return true;
}

async function createPlugin() {
  const flags = parseArgs();
  let pluginName, moduleName;

  if (flags.pluginName && flags.moduleName) {
    // Validate flags
    const pluginValidation = validateName(flags.pluginName, 'Plugin');
    if (pluginValidation !== true) {
      console.error(`Error: ${pluginValidation}`);
      process.exit(1);
    }
    const moduleValidation = validateName(flags.moduleName, 'Module');
    if (moduleValidation !== true) {
      console.error(`Error: ${moduleValidation}`);
      process.exit(1);
    }
    pluginName = flags.pluginName;
    moduleName = flags.moduleName;
    console.log(`Using flags: plugin=${pluginName}, module=${moduleName}`);
  } else {
    // Interactive mode
    const answers = await prompt([
      {
        type: 'input',
        name: 'pluginName',
        message: 'What is the name of your plugin?',
        required: true,
        validate: (input) => validateName(input, 'Plugin'),
      },
      {
        type: 'input',
        name: 'moduleName',
        message: 'What is the name of your module?',
        required: true,
        validate: (input) => validateName(input, 'Module'),
      },
    ]);
    pluginName = answers.pluginName;
    moduleName = answers.moduleName;
  }

  // Convert plugin name to kebab case
  const kebabCaseName = pluginName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

  const PascalCaseName = pluginName.replace(/(^\w|-\w)/g, (match) =>
    match.replace('-', '').toUpperCase(),
  );

  // Convert module name to kebab case
  const kebabCaseModuleName = moduleName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

  // Create frontend plugin
  const frontendPluginDir = path.join(
    __dirname,
    '..',
    'frontend',
    'plugins',
    kebabCaseName + '_ui',
  );

  // Create frontend plugin directory structure
  const frontendDirectories = [
    '',
    'src',
    'src/assets',
    'src/modules',
    `src/modules/${kebabCaseModuleName}`,
    'src/pages',
    `src/pages/${kebabCaseModuleName}`,
    'src/widgets',
  ];

  frontendDirectories.forEach((dir) => {
    fs.mkdirSync(path.join(frontendPluginDir, dir), { recursive: true });
  });

  // Create example assets
  const exampleIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const exampleImageSvg = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#F3F4F6"/>
  <path d="M100 70C88.9543 70 80 78.9543 80 90C80 101.046 88.9543 110 100 110C111.046 110 120 101.046 120 90C120 78.9543 111.046 70 100 70Z" fill="#9CA3AF"/>
  <path d="M140 130C140 116.745 128.255 105 115 105H85C71.7452 105 60 116.745 60 130V130H140V130Z" fill="#9CA3AF"/>
</svg>`;

  const assetsReadme = `# Assets Directory

This directory contains static assets used by the plugin.

## Contents

- \`example-icon.svg\`: Example icon in SVG format
- \`example-image.svg\`: Example placeholder image in SVG format

## Usage

Import assets in your components like this:

\`\`\`tsx
import exampleIcon from '~/assets/example-icon.svg';
import exampleImage from '~/assets/example-image.svg';
\`\`\`

## Best Practices

1. Use SVG format for icons and simple graphics
2. Optimize images before adding them to the assets folder
3. Keep file names descriptive and in kebab-case
4. Document any new assets added to this directory
`;

  // Write assets
  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'assets', 'example-icon.svg'),
    exampleIconSvg,
  );

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'assets', 'example-image.svg'),
    exampleImageSvg,
  );

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'assets', 'README.md'),
    assetsReadme,
  );

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${pluginName}</title>
    <base href="/" />

    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'index.html'),
    indexHtml,
  );

  // Create config.tsx
  const configContent = `
import { IconSandbox } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';
import { IUIConfig } from 'erxes-ui';

const ${PascalCaseName}SettingsNavigation = lazy(() =>
  import('@/${PascalCaseName}SettingsNavigation').then((module) => ({
    default: module.${PascalCaseName}SettingsNavigation,
  })),
);

const ${PascalCaseName}Navigation = lazy(() =>
  import('@/${PascalCaseName}Navigation').then((module) => ({
    default: module.${PascalCaseName}Navigation,
  })),
);


export const CONFIG: IUIConfig = {
  name: '${kebabCaseName}',
  path: '${kebabCaseName}',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <${PascalCaseName}SettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: '${kebabCaseName}',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <${PascalCaseName}Navigation />
      </Suspense>
    ),
  },

  modules: [
    {
      name: '${moduleName}',
      icon: IconSandbox,
      path: '${kebabCaseModuleName}',
    },
  ],
};
`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'config.tsx'),
    configContent,
  );

  // Create Main.tsx for the module
  const mainContent = `import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const IndexPage = lazy(() =>
  import('~/pages/${kebabCaseModuleName}/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

export const ${PascalCaseName}Main = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
      </Routes>
    </Suspense>
  );
};
`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'modules', `${PascalCaseName}Main.tsx`),
    mainContent,
  );

  // Create Navigation.tsx for the module
  const navigationContent = `
  import { NavigationMenuLinkItem } from 'erxes-ui';
  import { IconSandbox } from '@tabler/icons-react';

export const ${PascalCaseName}Navigation = () => {
  return (
    <>
     <NavigationMenuLinkItem
        name="${moduleName}"
        icon={IconSandbox}
        path="${kebabCaseModuleName}"
      />
    </>
  );
};
`;

  fs.writeFileSync(
    path.join(
      frontendPluginDir,
      'src',
      'modules',
      `${PascalCaseName}Navigation.tsx`,
    ),
    navigationContent,
  );

  // Create Navigation.tsx for the module
  const settingsNavigationContent = `
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const ${PascalCaseName}SettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">${moduleName}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={"${kebabCaseName}" + '/' + "${kebabCaseModuleName}"}
            path="${kebabCaseModuleName}"
            name="${moduleName}"
          />
          
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
`;

  fs.writeFileSync(
    path.join(
      frontendPluginDir,
      'src',
      'modules',
      `${PascalCaseName}SettingsNavigation.tsx`,
    ),
    settingsNavigationContent,
  );

  // Create Settings.tsx for the module
  const settingsContent = `export const ${PascalCaseName}Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">${moduleName} Settings</h1>
      <p className="mt-4 text-muted-foreground">
        Configure your ${moduleName} settings here.
      </p>
    </div>
  );
};
`;

  fs.writeFileSync(
    path.join(
      frontendPluginDir,
      'src',
      'modules',
      `${PascalCaseName}Settings.tsx`,
    ),
    settingsContent,
  );

  const moduleIndexPageContent = `import {
  IconCaretDownFilled,
  IconSandbox,
  IconSettings,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';

export const IndexPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/${kebabCaseModuleName}">
                    <IconSandbox />
                    ${moduleName}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/${kebabCaseModuleName}">
              <IconSettings />
              Go to settings
            </Link>
          </Button>
          <Button>
            More <IconCaretDownFilled />
          </Button>
        </PageHeader.End>
      </PageHeader>
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden flex-auto p-6">
          <div className="rounded-lg border bg-card p-8 text-card-foreground">
            <h2 className="text-xl font-semibold mb-2">${moduleName}</h2>
            <p className="text-muted-foreground">
              This is the ${moduleName} module. Add your content here using RecordTable, Form, and other erxes-ui components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

  fs.writeFileSync(
    path.join(
      frontendPluginDir,
      'src',
      'pages',
      kebabCaseModuleName,
      'IndexPage.tsx',
    ),
    moduleIndexPageContent,
  );

  // Create module-federation.config.ts
  const moduleFederationConfig = `import { ModuleFederationConfig } from '@nx/rspack/module-federation';

const coreLibraries = new Set([
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  '@apollo/client',
  'jotai',
  'ui-modules',
  'react-i18next',
]);

export const config: ModuleFederationConfig = {
  name: '${kebabCaseName}_ui',
  exposes: {
    './config': './src/config.tsx',
    './${kebabCaseName}': './src/modules/${PascalCaseName}Main.tsx',
    './${kebabCaseName}Settings': './src/modules/${PascalCaseName}Settings.tsx',
    './widgets': './src/widgets/Widgets.tsx',
  },

  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;
    }

    // Returning false means the library is not shared.
    return false;
  },
};

// Default export required by Nx/Rspack tooling - do not remove
export default config;
`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'module-federation.config.ts'),
    moduleFederationConfig,
  );

  // Create project.json
  const projectJson = {
    name: kebabCaseName + '_ui',
    $schema: '../../../node_modules/nx/schemas/project-schema.json',
    sourceRoot: 'frontend/plugins/' + kebabCaseName + '_ui/src',
    projectType: 'application',
    tags: [],
    targets: {
      build: {
        executor: '@nx/rspack:rspack',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          target: 'web',
          outputPath: 'dist/frontend/plugins/' + kebabCaseName + '_ui',
          main: 'frontend/plugins/' + kebabCaseName + '_ui/src/main.ts',
          tsConfig:
            'frontend/plugins/' + kebabCaseName + '_ui/tsconfig.app.json',
          rspackConfig:
            'frontend/plugins/' + kebabCaseName + '_ui/rspack.config.ts',
          assets: ['frontend/plugins/' + kebabCaseName + '_ui/src/assets'],
        },
        configurations: {
          development: {
            mode: 'development',
          },
          production: {
            mode: 'production',
            optimization: true,
            sourceMap: false,
            rspackConfig:
              'frontend/plugins/' + kebabCaseName + '_ui/rspack.config.prod.ts',
          },
        },
      },
      serve: {
        executor: '@nx/rspack:module-federation-dev-server',
        options: {
          buildTarget: kebabCaseName + '_ui:build:development',
          port: 3005,
        },
        configurations: {
          development: {},
          production: {
            buildTarget: kebabCaseName + '_ui:build:production',
          },
        },
      },
      'serve-static': {
        executor: '@nx/rspack:module-federation-static-server',
        defaultConfiguration: 'production',
        options: {
          serveTarget: kebabCaseName + '_ui:serve',
        },
        configurations: {
          development: {
            serveTarget: kebabCaseName + '_ui:serve:development',
          },
          production: {
            serveTarget: kebabCaseName + '_ui:serve:production',
          },
        },
      },
    },
  };

  fs.writeFileSync(
    path.join(frontendPluginDir, 'project.json'),
    JSON.stringify(projectJson, null, 2),
  );

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      jsx: 'react-jsx',
      allowJs: false,
      esModuleInterop: false,
      allowSyntheticDefaultImports: true,
      strict: true,
      paths: {
        'erxes-ui': ['frontend/libs/erxes-ui/src'],
        'erxes-ui/*': ['frontend/libs/erxes-ui/src/*'],
        '~/*': ['frontend/plugins/' + kebabCaseName + '_ui/src/*'],
        '~': ['frontend/plugins/' + kebabCaseName + '_ui/src'],
        '@/*': ['frontend/plugins/' + kebabCaseName + '_ui/src/modules/*'],
        '@': ['frontend/plugins/' + kebabCaseName + '_ui/src/modules'],
        'ui-modules': ['frontend/libs/ui-modules/src'],
        'ui-modules/*': ['frontend/libs/ui-modules/src/*'],
      },
    },
    files: [],
    include: [],
    references: [
      {
        path: './tsconfig.app.json',
      },
      {
        path: './tsconfig.spec.json',
      },
    ],
    extends: '../../../tsconfig.base.json',
  };

  fs.writeFileSync(
    path.join(frontendPluginDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2),
  );

  // Create tsconfig.app.json
  const tsConfigApp = {
    extends: './tsconfig.json',
    compilerOptions: {
      outDir: '../../../dist/out-tsc',
      types: [
        'node',
        '@nx/react/typings/cssmodule.d.ts',
        '@nx/react/typings/image.d.ts',
      ],
    },
    exclude: [
      'jest.config.ts',
      'src/**/*.spec.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.tsx',
      'src/**/*.test.tsx',
      'src/**/*.spec.js',
      'src/**/*.test.js',
      'src/**/*.spec.jsx',
      'src/**/*.test.jsx',
    ],
    include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
  };

  fs.writeFileSync(
    path.join(frontendPluginDir, 'tsconfig.app.json'),
    JSON.stringify(tsConfigApp, null, 2),
  );

  // Create tsconfig.spec.json
  const tsConfigSpec = {
    extends: './tsconfig.json',
    compilerOptions: {
      outDir: '../../../dist/out-tsc',
      module: 'commonjs',
      moduleResolution: 'node10',
      jsx: 'react-jsx',
      types: [
        'jest',
        'node',
        '@nx/react/typings/cssmodule.d.ts',
        '@nx/react/typings/image.d.ts',
      ],
    },
    include: [
      'jest.config.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.tsx',
      'src/**/*.test.js',
      'src/**/*.spec.js',
      'src/**/*.test.jsx',
      'src/**/*.spec.jsx',
      'src/**/*.d.ts',
    ],
  };

  fs.writeFileSync(
    path.join(frontendPluginDir, 'tsconfig.spec.json'),
    JSON.stringify(tsConfigSpec, null, 2),
  );

  // Create jest.config.ts
  const jestConfig = `/* eslint-disable */
// Default export required by Jest - do not remove
export default {
  displayName: '${kebabCaseName}-ui',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/plugins/${kebabCaseName}_ui',
};
`;

  fs.writeFileSync(path.join(frontendPluginDir, 'jest.config.ts'), jestConfig);

  // Create rspack.config.ts
  const rspackConfig = `import { composePlugins, withNx, withReact } from '@nx/rspack';
import { withModuleFederation } from '@nx/rspack/module-federation';

import { config as baseConfig } from './module-federation.config';

const config = {
  ...baseConfig,
};

// Default export required by Nx/Rspack tooling - do not remove
export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, { dts: false }),
);
`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'rspack.config.ts'),
    rspackConfig,
  );

  // Create rspack.config.prod.ts
  const rspackConfigProd = `export default require('./rspack.config');`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'rspack.config.prod.ts'),
    rspackConfigProd,
  );

  // Create eslint.config.js
  const eslintConfig = `const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../../eslint.config.js');

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
];
`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'eslint.config.js'),
    eslintConfig,
  );

  // Create main.ts
  const mainTsContent = `import('./bootstrap');`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'main.ts'),
    mainTsContent,
  );

  // Create bootstrap.tsx
  const bootstrapContent = `import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <div>App</div>
  </StrictMode>,
);
`;

  createBackendPlugin(pluginName, moduleName);

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'bootstrap.tsx'),
    bootstrapContent,
  );

  const widgetsContent = `export const Widgets = ({
  module,
  contentId,
  contentType,
}: {
  module: string;
  contentId: string;
  contentType: string;
}) => {
  return <div>${moduleName} Widget for {contentType} ({contentId})</div>;
};
`;

  fs.writeFileSync(
    path.join(frontendPluginDir, 'src', 'widgets', 'Widgets.tsx'),
    widgetsContent,
  );

  console.log(`Plugin "${kebabCaseName}" created successfully!`);
  console.log(`Start developing your plugin!`);
}

createPlugin();
