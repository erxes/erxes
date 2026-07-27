import { useTemplateAction } from '@/templates/hooks/useTemplateAction';
import { Template } from '@/templates/types/Template';
import { IconCopy } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TemplateUse = ({ template }: { template: Template }) => {
  const { t } = useTranslation('templates');
  const { useTemplate } = useTemplateAction();

  const handleUse = () => {
    useTemplate(template._id);
  };

  return (
    <Command.Item value="use" onSelect={handleUse}>
      <IconCopy className="w-4 h-4" />
      {t('use', 'Use')}
    </Command.Item>
  );
};
