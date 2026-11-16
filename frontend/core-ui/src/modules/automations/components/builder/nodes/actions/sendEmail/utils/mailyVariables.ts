import { EmailEditorVariable, JSONContent } from 'erxes-ui';

/**
 * Output variables already written into this email.
 *
 * Their labels are not stored with them, so reopening an email would draw
 * them as their raw token. The token itself reads well enough as a name.
 */
export const writtenVariables = (node?: JSONContent): EmailEditorVariable[] => {
  if (!node) {
    return [];
  }

  const id = node.type === 'variable' ? String(node.attrs?.id ?? '') : '';
  const own = id.startsWith('{{')
    ? [{ name: id, label: id.replace(/[{}]/g, '').trim(), required: false }]
    : [];

  return [...own, ...(node.content || []).flatMap(writtenVariables)];
};

/** The first words of the email, enough to recognise which one it is. */
export const readText = (node?: JSONContent): string => {
  if (!node) {
    return '';
  }

  if (node.type === 'variable') {
    return `{${node.attrs?.id ?? ''}}`;
  }

  if (node.text) {
    return node.text;
  }

  return (node.content || []).map(readText).join(' ');
};

const hasVariable = (list: EmailEditorVariable[], name: string) =>
  list.some((variable) => variable.name === name);

/** Adds the variables not in the list yet, keeping the list's own. */
export const withVariables = (
  list: EmailEditorVariable[],
  added: EmailEditorVariable[],
) => [...list, ...added.filter(({ name }) => !hasVariable(list, name))];

/** Written variables first, then the ones added while editing. */
export const editorVariables = (
  draft: JSONContent | undefined,
  added: EmailEditorVariable[],
) => [
  ...writtenVariables(draft).filter(({ name }) => !hasVariable(added, name)),
  ...added,
];

/**
 * An output variable as an editor field node. Not required: the editor marks
 * a required field with no default as a problem, and an output variable has
 * neither.
 */
export const outputVariableNode = (name: string, label: string) => ({
  type: 'variable',
  attrs: { id: name, label, fallback: null, required: false },
});
