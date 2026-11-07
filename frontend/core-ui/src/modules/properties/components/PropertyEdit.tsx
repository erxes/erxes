import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'erxes-ui';
import { useFieldDetail } from '@/properties/hooks/useFieldDetail';
import { useEditProperty } from '@/properties/hooks/useEditProperty';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '@/properties/states/needsToRefresh';
import { useTranslation } from 'react-i18next';
import { PropertyForm, RecordSidePanel, IPropertyForm } from 'ui-modules';
export const PropertyEdit = () => {
  const { t: panelT } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { basePath: propertiesBasePath } = usePropertiesScope();
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { id, type } = useParams<{
    groupId: string;
    id: string;
    type: string;
  }>();
  const { fieldDetail, loading, error } = useFieldDetail({
    id: id || '',
  });
  const { editProperty, loading: editPropertyLoading } = useEditProperty();
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);
  const navigate = useNavigate();
  const handleClose = () => navigate(`${propertiesBasePath}/${type}`);
  const [fieldType, ...relationType] = fieldDetail?.type?.split(':') || [];
  const handleSubmit = (data: IPropertyForm) => {
    editProperty({
      variables: {
        id,
        contentType: type,
        ...data,
      },
      onCompleted: () => {
        if (!pagePanel.isCurrent()) return;
        toast({
          title: t('property-updated', 'Property updated'),
          variant: 'success',
        });
        setNeedsToRefresh(true);
        handleClose();
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };
  const pagePanel = usePagePanel({
    name: 'properties/PropertyEdit',
    open: true,
    onOpenChange: handleClose,
    identity: id || 'new',
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded &&
      pagePanel.allowed &&
      !loading &&
      !error &&
      !(!loading && !fieldDetail) ? (
        <>
          {!loading && fieldDetail && (
            <>
              <RecordSidePanel.Header
                title={panelT('edit-property', 'Edit Property')}
                {...pagePanel.headerProps}
              />
              <PropertyForm
                onSubmit={handleSubmit}
                loading={editPropertyLoading}
                defaultValues={{
                  ...fieldDetail,
                  icon: fieldDetail?.icon ?? '123',
                  type: fieldType,
                  relationType: relationType.join(':'),
                  objectListConfigs:
                    fieldDetail?.configs?.objectListConfigs ?? [],
                }}
                isEdit
                locked={!!fieldDetail.owner}
                onCancel={handleClose}
                contentType={type || ''}
                fieldId={id}
                layout="record"
              />
            </>
          )}
        </>
      ) : (
        <PagePanelStatus entry={pagePanel} loading={loading} error={!!error} />
      )}
    </div>,
    pagePanel,
  );
};
