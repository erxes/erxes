import { TWorkflowTemplate } from '@/automations/hooks/useWorkflowTemplateList';
import { useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/** Edit and delete shared by the template table row and the template card. */
export const useWorkflowTemplateActions = ({
  template,
  onRemove,
}: {
  template: TWorkflowTemplate;
  onRemove: (templateId: string) => void;
}) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { t } = useTranslation('automations');

  const onEdit = () => navigate(`/automations/templates/${template._id}`);

  const handleRemove = () =>
    confirm({
      message: t('template-delete-confirm-message', { name: template.name }),
    }).then(() => onRemove(template._id));

  return { onEdit, onRemove: handleRemove };
};
