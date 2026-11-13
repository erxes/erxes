import { eslintCompatPlugin } from 'vite-plus/lint/plugins';

import { jsonParseThroughSchemaRule } from './rules/json-parse-through-schema.ts';
import { noChainedTypeAssertionsRule } from './rules/no-chained-type-assertions.ts';
import { noKnownValueWideningRule } from './rules/no-known-value-widening.ts';
import { noModuleMockingRule } from './rules/no-module-mocking.ts';
import { noQueryEnabledRule } from './rules/no-query-enabled.ts';
import { noReactForwardRefRule } from './rules/no-react-forwardref.ts';
import { noSilentCatchRule } from './rules/no-silent-catch.ts';
import { noSqlRawRule } from './rules/no-sql-raw.ts';
import { noUntypedZodRule } from './rules/no-untyped-zod.ts';
import { noReduceAccumulatorCopyRule } from './rules/no-reduce-accumulator-copy.ts';
import { noObjectParametersRule } from './rules/no-object-parameters.ts';
import { noReflectApplyRule } from './rules/no-reflect-apply.ts';
import { noReflectGetRule } from './rules/no-reflect-get.ts';
import { noRuntimeTypeofRule } from './rules/no-runtime-typeof.ts';
import { noForbiddenTermInSymbolNamesRule } from './rules/no-shape-in-symbol-names.ts';
import { noUnknownParametersRule } from './rules/no-unknown-parameters.ts';
import { noUnknownReturnsRule } from './rules/no-unknown-returns.ts';
import { noUnknownTypeAliasesRule } from './rules/no-unknown-type-aliases.ts';
import { noUnsafeDictionaryTypeRule } from './rules/no-unsafe-dictionary-type.ts';
import { noWidenThenAssertRule } from './rules/no-widen-then-assert.ts';
import { requireReadableSpacingRule } from './rules/require-readable-spacing.ts';

/** Generic Oxlint rules that reject low-evidence and low-signal implementation patterns. */
const antiSlopPlugin = eslintCompatPlugin({
  meta: { name: 'anti-slop' },
  rules: {
    'json-parse-through-schema': jsonParseThroughSchemaRule,
    'no-chained-type-assertions': noChainedTypeAssertionsRule,
    'no-known-value-widening': noKnownValueWideningRule,
    'no-module-mocking': noModuleMockingRule,
    'no-query-enabled': noQueryEnabledRule,
    'no-react-forwardref': noReactForwardRefRule,
    'no-silent-catch': noSilentCatchRule,
    'no-sql-raw': noSqlRawRule,
    'no-untyped-zod': noUntypedZodRule,
    'no-reduce-accumulator-copy': noReduceAccumulatorCopyRule,
    'no-object-parameters': noObjectParametersRule,
    'no-reflect-apply': noReflectApplyRule,
    'no-reflect-get': noReflectGetRule,
    'no-runtime-typeof': noRuntimeTypeofRule,
    'no-shape-in-symbol-names': noForbiddenTermInSymbolNamesRule,
    'no-unknown-parameters': noUnknownParametersRule,
    'no-unknown-returns': noUnknownReturnsRule,
    'no-unknown-type-aliases': noUnknownTypeAliasesRule,
    'no-unsafe-dictionary-type': noUnsafeDictionaryTypeRule,
    'no-widen-then-assert': noWidenThenAssertRule,
    'require-readable-spacing': requireReadableSpacingRule,
  },
});

export default antiSlopPlugin;
