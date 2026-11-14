import { defineConfig } from 'tsdown';
import { writeTemplates } from './scripts/templates.ts';

// The CLI as one ES module, with the templates next to it in dist/templates.
// `onlyImport` fails the build when dist imports anything outside `dependencies`.
export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'node',
  fixedExtension: false,
  dts: false,
  deps: { onlyImport: ['@clack/prompts', 'commander', 'tinyexec', 'zod'] },
  publint: true,
  hooks: { 'build:done': writeTemplates },
});
