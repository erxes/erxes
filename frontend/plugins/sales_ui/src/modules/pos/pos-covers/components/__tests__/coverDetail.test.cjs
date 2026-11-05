const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const i18n = require('i18next').createInstance();
const dictionaries = Object.fromEntries(
  ['en', 'mn'].map((language) => [
    language,
    {
      sales: JSON.parse(
        readFileSync(
          path.resolve(
            process.cwd(),
            `backend/gateway/src/locales/${language}/sales.json`,
          ),
          'utf8',
        ),
      ),
      common: JSON.parse(
        readFileSync(
          path.resolve(
            process.cwd(),
            `backend/gateway/src/locales/${language}/common.json`,
          ),
          'utf8',
        ),
      ),
    },
  ]),
);
i18n.init({
  lng: 'mn',
  fallbackLng: 'en',
  fallbackNS: 'common',
  initImmediate: false,
  resources: dictionaries,
});

function component(name) {
  const filename = path.resolve(__dirname, `../${name}.tsx`);
  const mod = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    {
      module: mod,
      exports: mod.exports,
      require: (id) => {
        if (id === 'react-i18next')
          return {
            useTranslation: () => ({
              t: i18n.getFixedT(i18n.language, 'sales'),
            }),
          };
        if (id === './CoverTerminalResults')
          return { CoverTerminalResults: component('CoverTerminalResults') };
        if (id === 'erxes-ui') {
          const passthrough = ({ children }) =>
            React.createElement(React.Fragment, null, children);
          const Tooltip = Object.assign(passthrough, {
            Provider: passthrough,
            Trigger: passthrough,
            Content: passthrough,
          });
          return {
            Tooltip,
            Popover: Tooltip,
            Button: (props) => {
              const { variant, ...rest } = props;
              return React.createElement('button', rest);
            },
            TextOverflowTooltip: ({ value }) =>
              React.createElement('span', null, value),
            isDefined: (value) => value != null,
            Textarea: (props) => React.createElement('textarea', props),
          };
        }
        return require(id);
      },
    },
    { filename },
  );
  return mod.exports[name];
}
const CoverDescription = component('CoverDescription');
const CoverTerminalResults = component('CoverTerminalResults');

test('POS closing note remains visible separately from Sales note and terminal results', () => {
  const html = renderToStaticMarkup(
    React.createElement(CoverDescription, {
      description: 'Кассын тэмдэглэл\n12500₮ зөрүү',
    }),
  );
  assert.match(html, /Хаалтын тэмдэглэл/);
  assert.match(html, /Кассын тэмдэглэл\n12500₮ зөрүү/);
  assert.match(html, /readonly/);
});
test('all terminal calls retain their own timestamps and original responses per paidType', () => {
  const html = renderToStaticMarkup(
    React.createElement(CoverTerminalResults, {
      details: [
        null,
        {
          _id: 'tdb',
          paidType: 'TDBCard',
          terminalResults: [
            {
              _id: '1',
              createdAt: '2026-10-29T01:01:01Z',
              response: '{"total":12500}',
            },
            null,
            {
              _id: '2',
              createdAt: '2026-10-29T01:02:02Z',
              response: 'Bank receipt\nSecond line',
            },
          ],
        },
        {
          _id: 'golomt',
          paidType: 'golomtCard',
          terminalResults: [
            { _id: '3', createdAt: '2026-10-29T02:00:00Z', response: null },
          ],
        },
      ],
    }),
  );
  assert.match(html, /TDBCard/);
  assert.match(html, /golomtCard/);
  assert.match(html, /12500/);
  assert.match(html, /Bank receipt\nSecond line/);
  assert.match(html, /2026-10-29T01:01:01Z/);
  assert.match(html, /2026-10-29T01:02:02Z/);
  assert.match(html, /Терминалын хариу хадгалагдаж дуусаагүй/);
});
test('missing terminal history has an explicit empty state', () => {
  const html = renderToStaticMarkup(
    React.createElement(CoverTerminalResults, { details: null }),
  );
  assert.match(html, /Терминалын хариу бүртгэгдээгүй/);
});

test('paidType tooltip contains only its own terminal responses and remains keyboard accessible', () => {
  const CoverPaidType = component('CoverPaidType');
  const html = renderToStaticMarkup(
    React.createElement(CoverPaidType, {
      detail: {
        paidType: 'TDBCard',
        terminalResults: [
          {
            _id: '1',
            createdAt: '2026-10-30T01:00:00Z',
            response: 'First TDB receipt',
          },
          {
            _id: '2',
            createdAt: '2026-10-30T02:00:00Z',
            response: 'Second TDB receipt',
          },
        ],
      },
    }),
  );
  assert.match(html, /tabindex="0"/);
  assert.match(html, /TDBCard: Терминалын хариунууд/);
  assert.match(html, /First TDB receipt/);
  assert.match(html, /Second TDB receipt/);
  assert.match(html, /<textarea[^>]*readonly/);
  assert.doesNotMatch(html, /<textarea[^>]*disabled/);
  assert.doesNotMatch(html, /<h3/);
});
test('paidType without terminal results does not offer an empty terminal tooltip', () => {
  const CoverPaidType = component('CoverPaidType');
  const html = renderToStaticMarkup(
    React.createElement(CoverPaidType, {
      detail: { paidType: 'cashAmount', terminalResults: [] },
    }),
  );
  assert.match(html, /cashAmount/);
  assert.doesNotMatch(html, /Терминалын хариунууд|tabindex/);
});

test('cover component keys are registered in both supported dictionaries', () => {
  for (const name of [
    'CoversSheet',
    'CoverDescription',
    'CoverPaidType',
    'CoverTerminalResults',
  ]) {
    const source = readFileSync(
      path.resolve(__dirname, `../${name}.tsx`),
      'utf8',
    );
    const keys = [...source.matchAll(/\bt\(\s*'([^']+)'/g)].map(
      (match) => match[1],
    );
    for (const language of ['en', 'mn']) {
      for (const key of keys) {
        assert.ok(
          dictionaries[language].sales[key] ||
            dictionaries[language].common[key],
          `${language}: ${key}`,
        );
      }
    }
  }
});
test('English labels and interpolated request numbers do not translate bank responses', async () => {
  await i18n.changeLanguage('en');
  try {
    const note = renderToStaticMarkup(
      React.createElement(CoverDescription, {
        description: 'Кассын өөрийн тэмдэглэл',
      }),
    );
    assert.match(note, /POS closing note/);
    assert.match(note, /Кассын өөрийн тэмдэглэл/);
    const response = renderToStaticMarkup(
      React.createElement(CoverTerminalResults, {
        details: [
          {
            paidType: 'TDBCard',
            terminalResults: [
              {
                _id: '1',
                createdAt: '2026-10-30T01:00:00Z',
                response: 'Банкны эх хариу',
              },
            ],
          },
        ],
      }),
    );
    assert.match(response, /Request #1/);
    assert.match(response, /TDBCard: response to request #1/);
    assert.match(response, /Банкны эх хариу/);
    assert.doesNotMatch(response, /cover-terminal-|\{\{number\}\}/);
  } finally {
    await i18n.changeLanguage('mn');
  }
});
