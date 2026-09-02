import { useQuery } from '@apollo/client';
import { EmailEditor, EmailEditorVariable, JSONContent } from 'erxes-ui';
import { ATTRIBUTE_QUERY } from 'ui-modules/modules/documents/graphql/queries';

interface IAttribute {
  label?: string;
  name: string;
  value?: string;
}

export const BroadcastEmailEditor = ({
  contentJson,
  onChange,
}: {
  contentJson?: JSONContent;
  onChange: (contentJson: JSONContent) => void;
}) => {
  const { data } = useQuery(ATTRIBUTE_QUERY, {
    variables: { contentType: 'core:contacts.customers' },
  });

  const attributes: IAttribute[] = data?.fieldsCombinedByContentType || [];

  const variables: EmailEditorVariable[] = attributes.map((attribute) => ({
    name: attribute.value || attribute.name,
    label: attribute.label || attribute.name,
    required: false,
  }));

  return (
    <EmailEditor
      contentJson={contentJson}
      onChange={onChange}
      variables={variables}
      className="flex-1"
    />
  );
};
