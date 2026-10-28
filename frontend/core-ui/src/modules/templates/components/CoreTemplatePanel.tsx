import { IconBrandDatabricks } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateForm } from 'ui-modules';
import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';

export const CoreTemplatePanel = ({
  contentType,
  contentId,
}: {
  contentType: string;
  contentId: string;
}) => {
  const { t } = useTranslation('templates');
  const [open, setOpen] = useState(false);
  return (
    <CoreModulePanel
      name={`templates/new/${contentType}/${contentId}`}
      open={open}
      onOpenChange={setOpen}
    >
      <CoreModulePanel.Trigger asChild>
        <Button variant="secondary">
          <IconBrandDatabricks />
          {t('template', 'Template')}
        </Button>
      </CoreModulePanel.Trigger>
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
          onClose={() => setOpen(false)}
        />
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
