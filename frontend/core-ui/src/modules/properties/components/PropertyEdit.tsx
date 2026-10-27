import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'erxes-ui';
import { useFieldDetail } from '../hooks/useFieldDetail';
import { useEditProperty } from '../hooks/useEditProperty';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '../states/needsToRefresh';
import { useTranslation } from 'react-i18next';
import { IPropertyForm, PropertyForm } from 'ui-modules';

export const PropertyEdit = () => {
  const { basePath: propertiesBasePath } = usePropertiesScope();
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { id, type } = useParams<{
    groupId: string;
    id: string;
    type: string;
  }>();

  const { fieldDetail, loading, error } = useFieldDetail({ id: id || '' });
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

  return (
    <CoreModulePanel
      name={'properties/PropertyEdit'}
      open
      onOpenChange={handleClose}
    >
      <CoreModulePanel.View
        loading={loading}
        error={!!error}
        notFound={!loading && !fieldDetail}
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {!loading && fieldDetail && (
          <PropertyForm
            onSubmit={handleSubmit}
            loading={editPropertyLoading}
            defaultValues={{
              ...fieldDetail,
              icon: fieldDetail?.icon ?? '123',
              type: fieldType,
              relationType: relationType.join(':'),
              objectListConfigs: fieldDetail?.configs?.objectListConfigs ?? [],
            }}
            isEdit
            locked={!!fieldDetail.owner}
            onCancel={handleClose}
            contentType={type || ''}
            fieldId={id}
          />
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
