import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { defineRule, type ESTree } from 'vite-plus/lint/plugins';

const installs = new Map<string, Set<string>>();

/** The components and hooks the erxes-ui installed for `file` exports, from its exports.txt. */
const uiExports = (file: string) => {
  let manifest: string;
  let list: string;

  try {
    manifest = createRequire(file).resolve('erxes-ui/package.json');
    list = readFileSync(join(dirname(manifest), 'exports.txt'), 'utf8');
  } catch (error) {
    throw new Error(
      `erxes/no-erxes-ui-copy reads exports.txt from the erxes-ui ${file} imports; install erxes-ui 4.0.0-v2.10 or later there`,
      { cause: error },
    );
  }

  const cached = installs.get(manifest);

  if (cached) return cached;

  const names = new Set(
    list.split('\n').flatMap((line) => {
      const [kind, name] = line.split(' ');

      return kind === 'value' && name && /^(use)?[A-Z]/.test(name) ? [name] : [];
    }),
  );

  installs.set(manifest, names);

  return names;
};

/**
 * A plugin UI builds on erxes-ui, so a component or hook named like one of its exports
 * (`RecordTable`, `RecordList`, `useOpenRecord`) is a second copy of it. The names come from
 * the erxes-ui the file resolves, so the rule follows the installed version.
 */
export const noErxesUiCopyRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow declaring a component or hook erxes-ui already exports.' },
    messages: {
      copy: "erxes-ui exports {{name}}: import it from 'erxes-ui' instead of writing another. node_modules/erxes-ui/CATALOG.md says what each export is for.",
    },
  },
  createOnce(context) {
    let names = new Set<string>();

    const check = (id: ESTree.BindingIdentifier | null | undefined) => {
      if (id && names.has(id.name))
        context.report({ node: id, messageId: 'copy', data: { name: id.name } });
    };

    return {
      before() {
        names = uiExports(context.filename);
      },
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier') check(node.id);
      },
      FunctionDeclaration(node) {
        check(node.id);
      },
      ClassDeclaration(node) {
        check(node.id);
      },
    };
  },
});
