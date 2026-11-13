import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { noReactForwardRefRule } from './no-react-forwardref.ts';

RuleTester.describe = describe;

RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
});

const error = { messageId: 'forwardRef' };

tester.run('anti-slop/no-react-forwardref', noReactForwardRefRule, {
  valid: [
    'const Button = ({ ref, ...props }: Props) => <button ref={ref} {...props} />;',
    'const memo = React.memo(Component);',
    'const value = other.forwardRef;',
  ],
  invalid: [
    {
      name: 'member call',
      code: 'const Button = React.forwardRef((props, ref) => <button ref={ref} {...props} />);',
      errors: [error],
    },
    {
      name: 'computed access',
      code: "const Button = React['forwardRef']((props, ref) => null);",
      errors: [error],
    },
    { name: 'reference without a call', code: 'const wrap = React.forwardRef;', errors: [error] },
  ],
});
