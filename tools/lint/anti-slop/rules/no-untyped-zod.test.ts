import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { noUntypedZodRule } from './no-untyped-zod.ts';

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });

tester.run('anti-slop/no-untyped-zod', noUntypedZodRule, {
  valid: [
    'const Value = z.unknown();',
    'const Labels = z.record(z.string(), z.string());',
    'const Pairs = z.record(z.string(), z.tuple([z.unknown(), z.unknown()]));',
    'const Data = JsonBlob.optional();',
    'const value = other.any();',
  ],
  invalid: [
    { name: 'any', code: 'const Value = z.any();', errors: [{ messageId: 'any' }] },
    {
      name: 'record of unknown',
      code: 'const Data = z.record(z.string(), z.unknown());',
      errors: [{ messageId: 'unknownRecord' }],
    },
    {
      name: 'chained record of unknown',
      code: 'const Data = z.record(z.string().max(60), z.unknown()).optional();',
      errors: [{ messageId: 'unknownRecord' }],
    },
    {
      name: 'single-argument record',
      code: 'const Data = z.record(z.unknown());',
      errors: [{ messageId: 'unknownRecord' }],
    },
  ],
});
