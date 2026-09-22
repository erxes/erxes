import type { Editor as TiptapEditor } from '@tiptap/core';
import { EmailEditor, EmailEditorVariable, JSONContent } from 'erxes-ui';
import { useCallback, useRef } from 'react';
import { useAttributes } from 'ui-modules';

type TAttribute = {
  name?: string;
  label?: string;
  value?: string;
};

export const EmailContentEditor = ({
  contentJson,
  onChange,
  onCreate,
  editable = true,
}: {
  contentJson?: JSONContent;
  onChange: (contentJson: JSONContent) => void;
  onCreate?: (editor: TiptapEditor) => void;
  editable?: boolean;
}) => {
  // Customer fields, wherever an email is written: a campaign, an automation
  // or a template all offer the person the same placeholders.
  const { attributes } = useAttributes({
    contentType: 'core:contacts.customers',
    attributesConfig: {},
    additionalAttributes: [],
    attributeTypes: [],
  });

  const fields = useRef<EmailEditorVariable[]>([]);

  fields.current = (attributes || []).map((attribute: TAttribute) => ({
    name: attribute.value || attribute.name || '',
    label: attribute.label || attribute.name,
    required: false,
  }));

  // Read through a ref rather than handed over as a list: the editor keeps the
  // extension options it was created with, and the fields arrive after it.
  const variables = useCallback(({ query }: { query: string }) => {
    const search = query.toLowerCase();

    return fields.current.filter(({ name, label }) =>
      `${label || ''} ${name}`.toLowerCase().includes(search),
    );
  }, []);

  return (
    <EmailEditor
      contentJson={contentJson}
      onChange={onChange}
      onCreate={onCreate}
      variables={variables}
      editable={editable}
      className="flex-1"
    />
  );
};
