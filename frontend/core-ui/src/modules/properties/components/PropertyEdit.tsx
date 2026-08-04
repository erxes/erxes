import { useNavigate, useParams } from 'react-router';
import { Sheet } from 'erxes-ui';
import { PropertyForm } from './PropertyForm';
import { useFieldDetail } from '../hooks/useFieldDetail';
import { useEditProperty } from '../hooks/useEditProperty';
import { IPropertyForm } from '../types/Properties';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '../states/needsToRefresh';

export const PropertyEdit = () => {
  const { id, type } = useParams<{
    groupId: string;
    id: string;
    type: string;
  }>();

  const { fieldDetail, loading } = useFieldDetail({ id: id || '' });
  const { editProperty, loading: editPropertyLoading } = useEditProperty();
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);

  const navigate = useNavigate();

  const handleClose = () => navigate(`/settings/properties/${type}`);

  const [fieldType, ...relationType] = fieldDetail?.type?.split(':') || [];

  const handleSubmit = (data: IPropertyForm) => {
    editProperty({
      variables: {
        id,
        contentType: type,
        ...data,
      },
      onCompleted: () => {
        setNeedsToRefresh(true);
        handleClose();
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
        {!loading && fieldDetail && (
          <PropertyForm
            onSubmit={handleSubmit}
            loading={editPropertyLoading}
            defaultValues={{
              ...fieldDetail,
              icon: fieldDetail?.icon ?? '123',
              type: fieldType,
              relationType: relationType.join(':'),
            }}
            isEdit
            onCancel={handleClose}
            contentType={type || ''}
            fieldId={id}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
