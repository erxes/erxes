const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const { runInThisContext } = require('node:vm');

const compiled = ts.transpileModule(
  readFileSync(path.join(__dirname, '../cursorList.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const cursor = {};
runInThisContext(`(function(exports, require) { ${compiled}\n})`)(
  cursor,
  (name) => {
    assert.equal(name, 'erxes-ui');
    return {
      mergeCursorData: ({ fetchMoreResult }) => ({
        list: fetchMoreResult.list,
        pageInfo: fetchMoreResult.pageInfo,
      }),
    };
  },
);

const page = (totalCount) => ({
  list: [],
  totalCount,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
});

test('pagination retains the previous total when omitted and accepts fresh totals including zero', () => {
  assert.equal(
    cursor.mergeCursorList('forward', page(21), page(null)).totalCount,
    21,
  );
  assert.equal(
    cursor.mergeCursorList('forward', page(21), page(40)).totalCount,
    40,
  );
  assert.equal(
    cursor.mergeCursorList('forward', page(21), page(0)).totalCount,
    0,
  );
  assert.equal(
    cursor.mergeCursorList('forward', page(null), page(null)).totalCount,
    null,
  );
});
