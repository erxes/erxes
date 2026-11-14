import type { Editor as TiptapEditor } from '@tiptap/core';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastInsertTemplate } from '@/broadcast/hooks/useBroadcastInsertTemplate';
import { IEmailTemplate } from '@/emailTemplates/types';

export const BroadcastInsertTemplate = ({
  editor,
}: {
  editor: TiptapEditor;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { templates, insertTemplate } = useBroadcastInsertTemplate(editor);

  if (!templates.length) {
    return null;
  }

  return (
    <Select onValueChange={insertTemplate}>
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
