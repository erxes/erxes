import { eslintCompatPlugin } from 'vite-plus/lint/plugins';

import { noReduceAccumulatorCopyRule } from './rules/no-reduce-accumulator-copy.ts';
import { noObjectParametersRule } from './rules/no-object-parameters.ts';
import { noReflectApplyRule } from './rules/no-reflect-apply.ts';
import { noReflectGetRule } from './rules/no-reflect-get.ts';
import { noForbiddenTermInSymbolNamesRule } from './rules/no-shape-in-symbol-names.ts';
import { noUnknownTypeAliasesRule } from './rules/no-unknown-type-aliases.ts';
import { noWidenThenAssertRule } from './rules/no-widen-then-assert.ts';
import { requireReadableSpacingRule } from './rules/require-readable-spacing.ts';
import { noZodCatchRule } from './rules/no-zod-catch.ts';

/** Generic Oxlint rules that reject low-evidence and low-signal implementation patterns. */
const antiSlopPlugin = eslintCompatPlugin({
  meta: { name: 'anti-slop' },
  rules: {
    'no-reduce-accumulator-copy': noReduceAccumulatorCopyRule,
    'no-object-parameters': noObjectParametersRule,
    'no-reflect-apply': noReflectApplyRule,
    'no-reflect-get': noReflectGetRule,
    'no-shape-in-symbol-names': noForbiddenTermInSymbolNamesRule,
    'no-unknown-type-aliases': noUnknownTypeAliasesRule,
    'no-widen-then-assert': noWidenThenAssertRule,
    'require-readable-spacing': requireReadableSpacingRule,
    'no-zod-catch': noZodCatchRule,
  },
});

export default antiSlopPlugin;
