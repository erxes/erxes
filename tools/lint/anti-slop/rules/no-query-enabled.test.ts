import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { noQueryEnabledRule } from './no-query-enabled.ts';

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });
const error = { messageId: 'queryEnabled' };

tester.run('anti-slop/no-query-enabled', noQueryEnabledRule, {
  valid: [
    'useQuery(orpc.users.get.queryOptions({ input: id ? { id } : skipToken }));',
    'useQuery(orpc.users.list.queryOptions({ input: {}, staleTime: 0 }));',
    'useQuery({ queryKey: ["x"], queryFn, enabled: open });',
    'useNotificationList({ enabled: open });',
    'useQuery(orpc.users.list.queryOptions({ input: { enabled: true } }));',
  ],
  invalid: [
    {
      name: 'enabled in queryOptions',
      code: 'useQuery(orpc.users.get.queryOptions({ input: { id: id ?? "" }, enabled: !!id }));',
      errors: [error],
    },
    {
      name: 'enabled in infiniteOptions',
      code: 'useInfiniteQuery(orpc.users.list.infiniteOptions({ input, enabled: open }));',
      errors: [error],
    },
    {
      name: 'shorthand enabled',
      code: 'useQuery(orpc.users.list.queryOptions({ enabled }));',
      errors: [error],
    },
  ],
});
