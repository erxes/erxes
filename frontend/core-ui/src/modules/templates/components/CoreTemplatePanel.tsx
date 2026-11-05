import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { TemplateForm, useSidePanel } from 'ui-modules';
import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';

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
  const panel = useSidePanel();
  const currentPanel = useRef(panel);
  currentPanel.current = panel;
  const name = `templates/new/${contentType}/${contentId}`;
  return (
    <CoreModulePanel name={name} open={open} onOpenChange={onOpenChange}>
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
          onClose={() => {
            currentPanel.current.dismissPath(getModulePanelPath(name));
            onOpenChange(false);
          }}
        />
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
