import { useEmailDocumentBlock } from '@/emailTemplates/hooks/useEmailDocumentBlock';
import type { Editor as TiptapEditor } from '@tiptap/core';
import {
  EmailEditor,
  EmailEditorProps,
  EmailEditorVariable,
  JSONContent,
} from 'erxes-ui';
import { useCallback, useRef } from 'react';
import { useAttributes } from 'ui-modules';

type TAttribute = {
  name?: string;
  label?: string;
  value?: string;
};

/** A campaign and a template are always written about a customer. */
const DEFAULT_CONTENT_TYPE = 'core:contacts.customers';

export const EmailContentEditor = ({
  contentJson,
  onChange,
  onCreate,
  editable = true,
  contentType,
  extensions,
  extraVariables,
}: {
  contentJson?: JSONContent;
  onChange: (contentJson: JSONContent) => void;
  onCreate?: (editor: TiptapEditor) => void;
  editable?: boolean;
  /** Whose fields to offer — the record this email is written about. */
  contentType?: string;
  extensions?: EmailEditorProps['extensions'];
  /** Fields the record does not own — an automation's output variables. */
  extraVariables?: EmailEditorVariable[];
}) => {
  const { attributes } = useAttributes({
    contentType: contentType || DEFAULT_CONTENT_TYPE,
    attributesConfig: {},
    additionalAttributes: [],
    attributeTypes: [],
  });

  const { blocks, documentPicker } = useEmailDocumentBlock();

  const fields = useRef<EmailEditorVariable[]>([]);

  fields.current = [
    ...(attributes || []).map((attribute: TAttribute) => ({
      name: attribute.value || attribute.name || '',
      label: attribute.label || attribute.name,
      required: false,
    })),
    ...(extraVariables || []),
  ];

  // Read through a ref rather than handed over as a list: the editor keeps the
  // extension options it was created with, and the fields arrive after it.
  const variables = useCallback(({ query }: { query: string }) => {
    const search = query.toLowerCase();

    return fields.current.filter(({ name, label }) =>
      `${label || ''} ${name}`.toLowerCase().includes(search),
    );
  }, []);

  return (
    <>
      <EmailEditor
        contentJson={contentJson}
        onChange={onChange}
        onCreate={onCreate}
        variables={variables}
        blocks={blocks}
        extensions={extensions}
        editable={editable}
        className="flex-1"
      />
      {editable && documentPicker}
    </>
  );
};
