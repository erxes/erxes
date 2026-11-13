import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { noSqlRawRule } from './no-sql-raw.ts';

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });
const error = { messageId: 'sqlRaw' };

tester.run('anti-slop/no-sql-raw', noSqlRawRule, {
  valid: [
    'const query = sql`select ${value}`;',
    'const column = sql.identifier(name);',
    'const list = sql.join(values, sql`, `);',
    'const text = String.raw`a\\b`;',
    'const value = other.raw(text);',
  ],
  invalid: [
    { name: 'raw string', code: 'await db.execute(sql.raw(statement));', errors: [error] },
    {
      name: 'raw inside a template',
      code: 'const query = sql`order by ${sql.raw(column)}`;',
      errors: [error],
    },
    { name: 'computed access', code: "const query = sql['raw'](text);", errors: [error] },
  ],
});
