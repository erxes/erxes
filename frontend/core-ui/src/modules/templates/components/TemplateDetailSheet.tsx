import { TemplateEditForm } from '@/templates/components/TemplateEditForm';
import { useTemplateDetail } from '@/templates/hooks/useTemplateDetail';
import { IconLoader2 } from '@tabler/icons-react';
import { Sheet, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TemplateDetailSheet = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const [templateId, setTemplateId] = useQueryState<string>('templateId');

  const { templateDetail, loading, error } = useTemplateDetail(
    templateId || undefined,
  );

  const handleClose = () => setTemplateId(null);

  return (
    <Sheet
      open={!!templateId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <Sheet.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        <Sheet.Header>
          <Sheet.Title>{t('edit-template')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        {loading && (
          <div className="flex flex-1 justify-center items-center p-5 min-h-[200px] text-muted-foreground">
            <IconLoader2 className="w-4 h-4 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <Sheet.Content className="flex flex-1 justify-center items-center p-5 text-muted-foreground">
            {error.message}
          </Sheet.Content>
        )}

        {!loading && templateDetail && (
          <TemplateEditForm
            key={templateDetail._id}
            template={templateDetail}
            onClose={handleClose}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
