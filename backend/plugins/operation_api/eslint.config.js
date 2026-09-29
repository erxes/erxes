const baseConfig = require('../../../eslint.config.js');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "NewExpression[callee.name='RegExp']:not(:has(CallExpression[callee.name='escapeRegExp'])):has(> *.arguments:not(Literal))",
          message:
            'Wrap user input in escapeRegExp from erxes-api-shared/utils before building a RegExp.',
        },
        {
          selector:
            ":matches(Property[key.name='$regex'], Property[key.value='$regex']) > *.value:not(Literal):not(:has(CallExpression[callee.name='escapeRegExp']))",
          message:
            'Wrap user input in escapeRegExp from erxes-api-shared/utils before using it in $regex.',
        },
      ],
    },
  },
];
