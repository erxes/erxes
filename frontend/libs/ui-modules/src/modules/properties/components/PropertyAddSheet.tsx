import { Sheet, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAddProperty } from '../hooks/useAddProperty';
import { IPropertyForm } from '../types/propertyFormTypes';
import { PropertyForm } from './PropertyForm';

const EMPTY_PROPERTY: IPropertyForm = {
  icon: '123',
  name: '',
  type: '',
  groupId: '',
  isSearchable: false,
  isVisible: true,
  isVisibleToCreate: false,
  isRequired: false,
  isVisibleInCard: false,
  description: '',
  code: '',
  options: [],
};

// Adds a property without leaving the page that needs it.
export const PropertyAddSheet = ({
  contentType,
  open,
  onClose,
  onCreated,
}: {
  contentType: string;
  open: boolean;
  onClose: () => void;
  onCreated?: (fieldId: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { addProperty, loading } = useAddProperty();

  const onSubmit = (data: IPropertyForm) =>
    addProperty({
      variables: { ...data, contentType },
      refetchQueries: ['Fields'],
      awaitRefetchQueries: true,
      onCompleted: (result: { fieldAdd?: { _id: string } }) => {
        toast({
          title: t('property-added', 'Property added'),
          variant: 'success',
        });

        if (result.fieldAdd?._id) {
          onCreated?.(result.fieldAdd._id);
        }

        onClose();
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        }),
    });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {open && (
          <PropertyForm
            onSubmit={onSubmit}
            loading={loading}
            defaultValues={EMPTY_PROPERTY}
            onCancel={onClose}
            contentType={contentType}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
