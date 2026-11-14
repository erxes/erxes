import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { procedureOutputRule } from './procedure-output.ts';

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });
const error = { messageId: 'output' };

tester.run('erxes/procedure-output', procedureOutputRule, {
  valid: [
    'const list = reads(view).input(Query).output(Page).handler(fn);',
    'const remove = writes(manage).output(Removed).input(Id).handler(fn);',
    'const get = scoped.tags.get.handler(fn);',
    'const get = procedures.get.handler(fn);',
  ],
  invalid: [
    {
      name: 'no output',
      code: 'const list = reads(view).input(Query).handler(fn);',
      errors: [error],
    },
    { name: 'bare builder', code: 'const me = reads().handler(fn);', errors: [error] },
  ],
});
