import { IPropertySystemField } from '@/properties/types/Properties';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanelContext,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { Button, Spinner, toast, cn } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Can,
  IPropertyForm,
  PropertyFormLogicFields,
  RecordSidePanel,
  SidePanelRecordPathContext,
} from 'ui-modules';
import { useEditPropertySystemField } from '@/properties/hooks/useEditPropertySystemField';
const SystemFieldLogicForm = ({
  field,
  contentType,
  onClose,
}: {
  field: IPropertySystemField;
  contentType: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { editSystemField, loading } = useEditPropertySystemField(contentType);
  const form = useForm<IPropertyForm>({
    defaultValues: {
      logics: field.logics,
    },
  });
  const handleSubmit = form.handleSubmit(async ({ logics }) => {
    const result = await editSystemField(field.code, {
      logics: (logics || []).filter((rule) => rule.field),
    });
    if (result.data) {
      toast({
        title: t('property-updated', 'Property updated'),
        variant: 'success',
      });
      onClose();
    }
  });
  const pagePanel = usePagePanelContext();
  return (
    <form className="flex h-full w-full flex-col" onSubmit={handleSubmit}>
      <RecordSidePanel.Header
        title={<>{field.name}</>}
        onBack={pagePanel.onBack}
        onClose={pagePanel.onClose}
        expanded={pagePanel.expanded}
        onExpand={pagePanel.onExpand}
      />
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-y-auto',
          'overflow-y-auto px-5 py-4',
        )}
      >
        <PropertyFormLogicFields form={form} contentType={contentType} />
      </div>
      <div
        className={cn(
          'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
        )}
      >
        <Button type="button" variant="ghost" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Can action="fieldsManage">
          <Button type="submit" disabled={loading}>
            {loading && <Spinner containerClassName="flex-none" />}
            {t('update-property', 'Update Property')}
          </Button>
        </Can>
      </div>
    </form>
  );
};
export const PropertySystemFieldLogicSheet = ({
  field,
  contentType,
  onClose,
}: {
  field: IPropertySystemField | null;
  contentType: string;
  onClose: () => void;
}) => {
  const pagePanel = usePagePanel({
    name: 'properties/PropertySystemFieldLogicSheet',
    open: !!field,
    onOpenChange: (open) => !open && onClose(),
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    {field && (
                      <SystemFieldLogicForm
                        key={field.code}
                        field={field}
                        contentType={contentType}
                        onClose={onClose}
                      />
                    )}
                  </>
                ) : (
                  <PagePanelStatus entry={pagePanel} />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
