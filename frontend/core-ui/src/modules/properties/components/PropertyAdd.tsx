import { Sheet, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '../states/needsToRefresh';
import {
  IPropertyContentScope,
  IPropertyForm,
  PropertyForm,
  useAddProperty,
} from 'ui-modules';

export const AddProperty = ({
  contentType,
  contentTypeId,
  groupId,
  onClose,
}: IPropertyContentScope & {
  groupId?: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { addProperty, loading } = useAddProperty();
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);

  const onSubmit = (data: IPropertyForm) => {
    addProperty({
      variables: {
        ...data,
        contentType,
        contentTypeId,
      },
      onCompleted: () => {
        toast({
          title: t('property-added', 'Property added'),
          variant: 'success',
        });
        setNeedsToRefresh(true);
        onClose();
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
    <Sheet open onOpenChange={onClose}>
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
            type: '',
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
          onCancel={onClose}
          contentType={contentType}
          contentTypeId={contentTypeId}
        />
      </Sheet.View>
    </Sheet>
  );
};
