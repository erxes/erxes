import { useNavigate, useParams } from 'react-router';
import { PropertyForm } from './PropertyForm';
import { useFieldDetail } from '../hooks/useFieldDetail';
import { useEditProperty } from '../hooks/useEditProperty';
import { IPropertyForm } from '../types/Properties';
import { getFieldType } from '../utils/getFieldType';

export const PropertyEdit = () => {
  const { groupId, id, type } = useParams<{
    groupId: string;
    id: string;
    type: string;
  }>();

  const { fieldDetail, loading } = useFieldDetail({ id: id || '' });
  const { editProperty, loading: editPropertyLoading } = useEditProperty();
  const navigate = useNavigate();

  const handleSubmit = (data: IPropertyForm) => {
    editProperty({
      variables: {
        id,
        groupId,
        contentType: type,
        ...data,
      },
      onCompleted: () => {
        navigate(`/settings/properties/${type}`);
      },
    });
  };

  if (loading) return null;

  return (
    <PropertyForm
      onSubmit={handleSubmit}
      loading={editPropertyLoading}
      defaultValues={{
        ...fieldDetail,
        ...getFieldType(fieldDetail.type),
      }}
      isEdit
    />
  );
};
