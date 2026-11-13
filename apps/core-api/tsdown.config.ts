import { cpSync } from 'node:fs';
import { defineConfig } from 'tsdown';

// One ESM bundle; workspace packages are inlined, npm packages stay external.
export default defineConfig({
  // The server, plus the operator commands a container runs without tsx:
  //   node dist/migrate.js · node dist/grant.js <role> · node dist/plugin-role.js <plugin>
  entry: {
    main: 'src/main.ts',
    migrate: 'scripts/migrate.ts',
    grant: 'scripts/grant.ts',
    'plugin-role': 'scripts/plugin-role.ts',
  },
  platform: 'node',
  target: 'node26',
  // The package is "type": "module", so `.js` is ESM.
  fixedExtension: false,
  sourcemap: true,
  deps: { alwaysBundle: [/^@erxes\//] },
  // The bundle applies core's migrations at startup: ship them next to it.
  onSuccess: () => {
    cpSync('../../packages/db/drizzle', 'dist/drizzle', { recursive: true });
  },
});
