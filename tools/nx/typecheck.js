const { existsSync, readFileSync } = require('fs');
const { dirname, join } = require('path');

const TSCONFIG_CANDIDATES = [
  'tsconfig.app.json',
  'tsconfig.lib.json',
  'tsconfig.json',
];

module.exports = {
  name: 'typecheck-inference',
  createNodesV2: [
    '**/project.json',
    (configFiles, _options, context) =>
      configFiles.map((configFile) => {
        const root = dirname(configFile);
        const projectJson = JSON.parse(
          readFileSync(join(context.workspaceRoot, configFile), 'utf-8'),
        );
        if (projectJson.targets && projectJson.targets.typecheck) {
          return [configFile, {}];
        }
        const tsconfig = TSCONFIG_CANDIDATES.find((file) =>
          existsSync(join(context.workspaceRoot, root, file)),
        );
        if (!tsconfig) {
          return [configFile, {}];
        }
        return [
          configFile,
          {
            projects: {
              [root]: {
                targets: {
                  typecheck: {
                    command: `tsc --noEmit -p ${root}/${tsconfig}`,
                    options: { cwd: '{workspaceRoot}' },
                    cache: true,
                    inputs: ['default', '^default'],
                  },
                },
              },
            },
          },
        ];
      }),
  ],
};
