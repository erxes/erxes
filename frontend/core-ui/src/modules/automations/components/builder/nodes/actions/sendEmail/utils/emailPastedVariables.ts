import { Extension } from '@tiptap/core';
import { Fragment, Node as PMNode, Schema, Slice } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';

const PLACEHOLDER = /\{\{\s*([^{}]+?)\s*\}\}/g;

const toToken = (path: string) => `{{ ${path.trim()} }}`;

/**
 * A field copied out of the block editor arrives as its chip, whose text is
 * only the label; its path is kept on `data-value`. It is written back as the
 * placeholder so the text pass below can turn it into a field.
 */
const attributeChipsToPlaceholders = (html: string) => {
  if (!html.includes('data-inline-content-type="attribute"')) {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');

  doc
    .querySelectorAll('[data-inline-content-type="attribute"]')
    .forEach((chip) => {
      const path =
        chip.getAttribute('data-value') || chip.getAttribute('data-name');

      chip.replaceWith(doc.createTextNode(path ? toToken(path) : ''));
    });

  return doc.body.innerHTML;
};

const splitText = (node: PMNode, schema: Schema): PMNode[] => {
  const text = node.text || '';
  const nodes: PMNode[] = [];
  let last = 0;

  for (const match of text.matchAll(PLACEHOLDER)) {
    const start = match.index ?? 0;

    if (start > last) {
      nodes.push(schema.text(text.slice(last, start), node.marks));
    }

    nodes.push(
      schema.nodes.variable.create({
        id: toToken(match[1]),
        fallback: null,
        required: false,
      }),
    );

    last = start + match[0].length;
  }

  if (last < text.length) {
    nodes.push(schema.text(text.slice(last), node.marks));
  }

  return nodes;
};

const replacePlaceholders = (
  fragment: Fragment,
  schema: Schema,
  // Text pasted straight into a paragraph has no parent in the slice.
  allowsVariables = true,
): Fragment => {
  const children: PMNode[] = [];

  fragment.forEach((child) => {
    if (child.isText) {
      children.push(...(allowsVariables ? splitText(child, schema) : [child]));
      return;
    }

    children.push(
      child.copy(
        replacePlaceholders(
          child.content,
          schema,
          !!child.type.contentMatch.matchType(schema.nodes.variable),
        ),
      ),
    );
  });

  return Fragment.from(children);
};

/**
 * Lets an email copied from elsewhere — the block editor, or text holding
 * `{{ … }}` placeholders — be pasted into the email editor with its fields
 * intact instead of as plain text the server cannot fill.
 */
export const EmailPastedVariables = Extension.create({
  name: 'emailPastedVariables',

  addProseMirrorPlugins() {
    const { schema } = this.editor;

    if (!schema.nodes.variable) {
      return [];
    }

    return [
      new Plugin({
        props: {
          transformPastedHTML: attributeChipsToPlaceholders,
          transformPasted: (slice) =>
            new Slice(
              replacePlaceholders(slice.content, schema),
              slice.openStart,
              slice.openEnd,
            ),
        },
      }),
    ];
  },
});
