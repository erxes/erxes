import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '@/properties/states/needsToRefresh';
import {
  PropertyForm,
  useAddProperty,
  RecordSidePanel,
  IPropertyForm,
} from 'ui-modules';
export const AddProperty = () => {
  const { t: panelT } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { basePath: propertiesBasePath } = usePropertiesScope();
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { groupId, type } = useParams<{
    groupId: string;
    type: string;
  }>();
  const { addProperty, loading } = useAddProperty();
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);
  const navigate = useNavigate();
  const handleClose = () => navigate(`${propertiesBasePath}/${type}`);
  const onSubmit = (data: IPropertyForm) => {
    addProperty({
      variables: {
        ...data,
        contentType: type,
      },
      onCompleted: () => {
        if (!pagePanel.isCurrent()) return;
        toast({
          title: t('property-added', 'Property added'),
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
    name: 'properties/PropertyAdd',
    open: true,
    onOpenChange: handleClose,
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <>
          <RecordSidePanel.Header
            title={panelT('add-property', 'Add Property')}
            {...pagePanel.headerProps}
          />
          <PropertyForm
            onSubmit={onSubmit}
            loading={loading}
            defaultValues={{
              icon: '123',
              name: '',
              type: type || '',
              groupId: groupId || '',
              isSearchable: false,
              isVisible: true,
              isVisibleToCreate: false,
              isRequired: false,
              isVisibleInCard: false,
              description: '',
              code: '',
              options: [],
            }}
            onCancel={handleClose}
            contentType={type || ''}
            layout="record"
          />
        </>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
