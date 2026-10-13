import { EmailEditorVariable, JSONContent } from 'erxes-ui';
import { TAutomationVariableDragPayload } from 'ui-modules';

const paragraph = (content: JSONContent[]): JSONContent[] => [
  { type: 'paragraph', content },
];

/**
 * A list output dropped into the email: a header row of its field labels and
 * one row of `{{ list.$.field }}` fields, which the send step writes once per
 * item. The labels are plain text, so the headers are renamed in place.
 */
export const buildEmailItemTable = (
  payload: TAutomationVariableDragPayload,
): { table: JSONContent; variables: EmailEditorVariable[] } => {
  const listPath = payload.token.replace(/^\{\{\s*|\s*\}\}$/g, '');
  const columns = (payload.fields || []).map((field) => ({
    label: field.label,
    name: `{{ ${listPath}.$.${field.key} }}`,
  }));

  return {
    table: {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: columns.map(({ label }) => ({
            type: 'tableHeader',
            content: paragraph([{ type: 'text', text: label }]),
          })),
        },
        {
          type: 'tableRow',
          content: columns.map(({ label, name }) => ({
            type: 'tableCell',
            content: paragraph([
              {
                type: 'variable',
                attrs: { id: name, label, fallback: null, required: false },
              },
            ]),
          })),
        },
      ],
    },
    variables: columns.map(({ label, name }) => ({
      name,
      label,
      required: false,
    })),
  };
};
