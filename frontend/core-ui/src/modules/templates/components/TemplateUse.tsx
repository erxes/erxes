import { useTemplateAction } from '@/templates/hooks/useTemplateAction';
import { Template } from '@/templates/types/Template';
import { IconCopy } from '@tabler/icons-react';
import { Command } from 'erxes-ui';

export const TemplateUse = ({ template }: { template: Template }) => {
  const { useTemplate } = useTemplateAction();

  const handleUse = () => {
    useTemplate(template._id);
  };

  return (
    <Command.Item value="use" onSelect={handleUse}>
      <IconCopy className="w-4 h-4" />
      Use
    </Command.Item>
  );
};
