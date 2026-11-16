import { fileURLToPath } from 'node:url';
import { RuleTester } from 'vite-plus/lint/plugins-dev';
import { describe, it } from 'vite-plus/test';

import { noErxesUiCopyRule } from './no-erxes-ui-copy.ts';

RuleTester.describe = describe;

RuleTester.it = it;

// apps/web installs erxes-ui as a plugin's ui/ does, so a file there reads its exports.txt.
const filename = fileURLToPath(new URL('../../../../apps/web/src/Page.tsx', import.meta.url));

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
});

const error = (name: string) => ({ messageId: 'copy', data: { name } });

tester.run('erxes/no-erxes-ui-copy', noErxesUiCopyRule, {
  valid: [
    { filename, code: "import { RecordTable } from 'erxes-ui';\nconst ItemsPage = () => null;" },
    { filename, code: 'const useItems = () => [];' },
    // Only components and hooks: erxes-ui's helpers and types name common words.
    { filename, code: 'const textOf = (value: unknown) => String(value);' },
    { filename, code: 'type Member = { id: string };' },
    { filename, code: 'const { Item } = Accordion;' },
  ],
  invalid: [
    {
      name: 'a component',
      filename,
      code: 'const RecordList = () => null;',
      errors: [error('RecordList')],
    },
    {
      name: 'an exported function',
      filename,
      code: 'export function PageHeader() { return null; }',
      errors: [error('PageHeader')],
    },
    {
      name: 'a hook',
      filename,
      code: 'const useOpenRecord = () => ({});',
      errors: [error('useOpenRecord')],
    },
    { name: 'a class', filename, code: 'class Badge {}', errors: [error('Badge')] },
  ],
});
