import { Sheet, toast } from 'erxes-ui';
import { PropertyForm } from './PropertyForm';
import { IPropertyForm } from '../types/Properties';
import { useAddProperty } from '../hooks/useAddProperty';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '../states/needsToRefresh';

export const AddProperty = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { groupId, type } = useParams<{
    groupId: string;
    type: string;
  }>();
  const { addProperty, loading } = useAddProperty();
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);
  const navigate = useNavigate();

  const handleClose = () => navigate(`/settings/properties/${type}`);

  const onSubmit = (data: IPropertyForm) => {
    addProperty({
      variables: {
        ...data,
        contentType: type,
      },
      onCompleted: () => {
        toast({ title: t('property-added', 'Property added'), variant: 'success' });
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
    <Sheet open onOpenChange={handleClose}>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
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
            validation: '',
            options: [],
          }}
          onCancel={handleClose}
          contentType={type || ''}
        />
      </Sheet.View>
    </Sheet>
  );
};
