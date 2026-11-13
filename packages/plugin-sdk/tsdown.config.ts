import { defineConfig } from 'tsdown';

// The publishable build: one ES module per source file, so `client` and `verify` are
// also subpaths. The workspace imports the sources: tsdown writes `exports` pointing
// at src/ and puts the dist ones in `publishConfig`.
export default defineConfig({
  entry: ['src/*.ts'],
  platform: 'node',
  fixedExtension: false,
  unbundle: true,
  dts: true,
  exports: { devExports: true },
  publint: true,
  attw: { profile: 'esm-only', level: 'error' },
});
