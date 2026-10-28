import { Sheet, Spinner, toast } from 'erxes-ui';
import { useFieldDetail } from '../hooks/useFieldDetail';
import { useEditProperty } from '../hooks/useEditProperty';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '../states/needsToRefresh';
import { useTranslation } from 'react-i18next';
import { IPropertyContentScope, IPropertyForm, PropertyForm } from 'ui-modules';

export const PropertyEdit = ({
  contentType,
  contentTypeId,
  fieldId,
  onClose,
}: IPropertyContentScope & {
  fieldId: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  const { fieldDetail, loading } = useFieldDetail({ id: fieldId });
  const { editProperty, loading: editPropertyLoading } = useEditProperty();
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);

  const [fieldType, ...relationType] = fieldDetail?.type?.split(':') || [];

  const handleSubmit = (data: IPropertyForm) => {
    editProperty({
      variables: {
        id: fieldId,
        contentType,
        ...data,
      },
      onCompleted: () => {
        toast({
          title: t('property-updated', 'Property updated'),
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
        {loading && <Spinner containerClassName="py-12" />}
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
            onCancel={onClose}
            contentType={contentType}
            contentTypeId={contentTypeId}
            fieldId={fieldId}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
