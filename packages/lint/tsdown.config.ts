import { defineConfig } from 'tsdown';

// The preset and the three lint plugins it names, one ES module each. The workspace imports
// the sources: tsdown writes `exports` pointing at src/ and puts the dist ones in
// `publishConfig`. `onlyImport` fails the build when dist imports anything outside
// `dependencies` and `peerDependencies`.
export default defineConfig({
  entry: [
    'src/index.ts',
    'src/shadcn.ts',
    'src/anti-slop/index.ts',
    'src/erxes/index.ts',
    'src/check-escapes.ts',
    'src/check-docs.ts',
    'src/check-copies.ts',
  ],
  platform: 'node',
  fixedExtension: false,
  dts: true,
  deps: { onlyImport: ['@shadcn/lint', 'oxc-parser', 'vite-plus', 'zod'] },
  exports: {
    devExports: true,
    // Sorted, as the formatter sorts package.json.
    bin: {
      'erxes-check-copies': './src/check-copies.ts',
      'erxes-check-docs': './src/check-docs.ts',
      'erxes-check-escapes': './src/check-escapes.ts',
    },
  },
  publint: true,
  attw: { profile: 'esm-only', level: 'error' },
});
