import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useLocation } from 'react-router-dom';
import {
  Can,
  IPropertyGroupForm,
  PropertyGroupForm,
  propertyGroupSchema,
  useAddPropertyGroup,
  SidePanelRecordPathContext,
  RecordSidePanel,
} from 'ui-modules';
export const AddPropertyGroup = () => {
  const { t: panelT } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { type } = useParams<{
    type: string;
  }>();
  const location = useLocation();
  const { addPropertyGroup, loading } = useAddPropertyGroup(type || '');
  const form = useForm<IPropertyGroupForm>({
    resolver: zodResolver(propertyGroupSchema),
    defaultValues: {
      name: '',
      code: '',
      isMultiple: false,
    },
  });
  const [open, setOpen] = useState<boolean>(false);
  const submitHandler: SubmitHandler<IPropertyGroupForm> = (data) => {
    addPropertyGroup({
      variables: {
        name: data.name,
        code: data.code,
        contentType: type,
        configs: {
          isMultiple: data.isMultiple,
        },
      },
      onCompleted: () => {
        if (!pagePanel.isCurrent()) return;
        form.reset();
        setOpen(false);
      },
    });
  };
  const pagePanel = usePagePanel({
    requiredPermission: 'fieldGroupsManage',
    name: 'properties/PropertyGroupAdd',
    onOpenChange: setOpen,
    open: open,
  });
  if (
    location.pathname.includes('add') ||
    location.pathname.split(type || '')[1]?.length > 2
  ) {
    return null;
  }
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Can action="fieldGroupsManage">
          <Button variant="outline" onClick={pagePanel.onOpen}>
            {t('add-group', 'Add Group')}
          </Button>
        </Can>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <>
                      <RecordSidePanel.Header
                        title={panelT('add-group', 'Add Group')}
                        onBack={pagePanel.onBack}
                        onClose={pagePanel.onClose}
                        expanded={pagePanel.expanded}
                        onExpand={pagePanel.onExpand}
                      />
                      <PropertyGroupForm
                        onSubmit={submitHandler}
                        loading={loading}
                        defaultValues={form.getValues()}
                        onCancel={() => setOpen(false)}
                        contentType={type || ''}
                        layout="record"
                      />
                    </>
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
