import type { Editor as TiptapEditor } from '@tiptap/core';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastEmailTemplates } from '../hooks/useBroadcastEmailTemplates';

export const BroadcastInsertTemplate = ({
  editor,
}: {
  editor: TiptapEditor;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { templates } = useBroadcastEmailTemplates();

  if (!templates.length) {
    return null;
  }

  const handleSelect = (templateId: string) => {
    const template = templates.find(
      (tpl: { _id: string }) => tpl._id === templateId,
    );

    if (template?.contentJson) {
      editor.commands.setContent(template.contentJson, true);
    }
  };

  return (
    <Select onValueChange={handleSelect}>
      <Select.Trigger className="w-auto">
        <Select.Value placeholder={t('insertTemplate')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {templates.map((template: { _id: string; name: string }) => (
            <Select.Item key={template._id} value={template._id}>
              {template.name}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
