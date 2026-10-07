import type { Editor as TiptapEditor } from '@tiptap/core';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import { emailTemplateFormat, IEmailTemplate } from '@/emailTemplates/types';

export const BroadcastInsertTemplate = ({
  editor,
}: {
  editor: TiptapEditor;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { emailTemplates } = useEmailTemplates();

  // Block templates cannot be poured into this editor, so they are not
  // offered here rather than inserted as something they are not.
  const templates = emailTemplates.filter(
    (template) => emailTemplateFormat(template) === 'maily',
  );

  if (!templates.length) {
    return null;
  }

  const handleSelect = (templateId: string) => {
    const template = templates.find(({ _id }) => _id === templateId);

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
          {templates.map((template: IEmailTemplate) => (
            <Select.Item key={template._id} value={template._id}>
              {template.name}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
