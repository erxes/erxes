// Local-only harness: real erxes primitives and CMS sheet, synthetic Apollo responses.
const { build } = require('esbuild');
const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

(async () => {
  const root = resolve(__dirname, '../../../..');
  const ui = resolve(root, 'frontend/libs/erxes-ui/src');
  const bundle = await build({
    entryPoints: [resolve(__dirname, 'postiz-preview.tsx')],
    bundle: true,
    write: false,
    format: 'esm',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [
      {
        name: 'erxes-preview-primitives',
        setup(builder) {
          builder.onResolve({ filter: /^erxes-ui$/ }, () => ({
            path: 'primitives',
            namespace: 'preview',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'preview' }, () => ({
            contents: ['Button', 'Sheet', 'Checkbox', 'Textarea']
              .map(
                (name) =>
                  `export { ${name} } from ${JSON.stringify(
                    resolve(ui, 'components', name.toLowerCase() + '.tsx'),
                  )};`,
              )
              .join('\n'),
            resolveDir: root,
          }));
          builder.onResolve({ filter: /^erxes-ui\/lib(?:\/utils)?$/ }, () => ({
            path: resolve(ui, 'lib/utils.ts'),
          }));
        },
      },
    ],
  });
  const from = resolve(root, 'frontend/core-ui/src/styles.css');
  const css = await postcss([tailwind()]).process(readFileSync(from, 'utf8'), {
    from,
  });
  createServer((req, res) => {
    if (req.url === '/app.js') {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(bundle.outputFiles[0].contents);
    } else if (req.url === '/style.css') {
      res.setHeader('Content-Type', 'text/css');
      res.end(css.css);
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CMS sharing preview</title><link rel="stylesheet" href="/style.css"><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
      );
    }
  }).listen(4318, '127.0.0.1', () =>
    console.log('Synthetic CMS preview: http://127.0.0.1:4318'),
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
