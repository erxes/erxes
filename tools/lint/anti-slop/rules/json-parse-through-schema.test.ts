import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { jsonParseThroughSchemaRule } from './json-parse-through-schema.ts';

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });
const error = { messageId: 'unparsedJson' };

tester.run('anti-slop/json-parse-through-schema', jsonParseThroughSchemaRule, {
  valid: [
    'const value = Schema.parse(JSON.parse(text));',
    'const result = Schema.safeParse(JSON.parse(text));',
    'const value = await Schema.parseAsync(JSON.parse(text));',
    'const value = z.array(Item).parse((JSON.parse(text)));',
    'const JSON = { parse: (text: string) => text.length }; const length = JSON.parse(text);',
    'const text = JSON.stringify(value);',
  ],
  invalid: [
    { name: 'bare parse', code: 'const value = JSON.parse(text);', errors: [error] },
    {
      name: 'asserted parse',
      code: 'const value = JSON.parse(text) as Settings;',
      errors: [error],
    },
    {
      name: 'second argument of a schema call',
      code: 'const value = Schema.parse(input, JSON.parse(text));',
      errors: [error],
    },
    {
      name: 'nested JSON.parse',
      code: 'const value = JSON.parse(JSON.parse(text));',
      errors: [error, error],
    },
    {
      name: 'computed access',
      code: "const value = JSON['parse'](text);",
      errors: [error],
    },
    {
      name: 'conditional parse',
      code: 'const value = Schema.parse(text ? JSON.parse(text) : null);',
      errors: [error],
    },
  ],
});
