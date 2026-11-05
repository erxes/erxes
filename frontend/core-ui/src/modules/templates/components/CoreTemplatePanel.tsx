import { useTranslation } from 'react-i18next';
import { TemplateForm } from 'ui-modules';
import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';

export const CoreTemplatePanel = ({
  contentType,
  contentId,
  open,
  onOpenChange,
}: {
  contentType: string;
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('templates');
  return (
    <CoreModulePanel
      name={`templates/new/${contentType}/${contentId}`}
      open={open}
      onOpenChange={onOpenChange}
    >
      <CoreModulePanel.View>
        <CoreModulePanel.Header>
          <CoreModulePanel.Title>
            {t('create-template', 'Create template')}
          </CoreModulePanel.Title>
          <CoreModulePanel.Close />
        </CoreModulePanel.Header>
        <TemplateForm
          contentType={contentType}
          contentId={contentId}
          onClose={() => onOpenChange(false)}
        />
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
