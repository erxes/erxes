const baseConfig = require('../../../eslint.config.js');

// A pattern part is safe only when it is a literal or a direct escapeRegExp()
// call. Inside a composed TemplateLiteral or BinaryExpression, every operand
// (template expression / binary left+right) must satisfy the same rule;
// deeper nesting is covered because the operand matcher applies at every level.
const UNSAFE_OPERAND =
  ":matches(BinaryExpression > :matches(*.left, *.right), TemplateLiteral > *.expressions):not(Literal):not(CallExpression[callee.name='escapeRegExp']):not(BinaryExpression):not(TemplateLiteral)";

const SAFE_TEMPLATE = `TemplateLiteral:not(:has(> *.expressions:not(Literal):not(CallExpression[callee.name='escapeRegExp'])))`;

const SAFE_BINARY = `BinaryExpression:not(:has(${UNSAFE_OPERAND}))`;

const NOT_SAFE_PATTERN = `:not(Literal):not(CallExpression[callee.name='escapeRegExp']):not(${SAFE_TEMPLATE}):not(${SAFE_BINARY})`;

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `NewExpression[callee.name='RegExp']:has(> *.arguments${NOT_SAFE_PATTERN})`,
          message:
            'Wrap user input in escapeRegExp from erxes-api-shared/utils before building a RegExp.',
        },
        {
          selector: `:matches(Property[key.name='$regex'], Property[key.value='$regex']) > *.value${NOT_SAFE_PATTERN}`,
          message:
            'Wrap user input in escapeRegExp from erxes-api-shared/utils before using it in $regex.',
        },
      ],
    },
  },
];
