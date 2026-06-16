import { useNavigate, useParams } from 'react-router';
import { PropertyForm } from './PropertyForm';
import { useFieldDetail } from '../hooks/useFieldDetail';
import { useEditProperty } from '../hooks/useEditProperty';
import { IPropertyForm } from '../types/Properties';
import { useSetAtom } from 'jotai';
import { needsToRefreshState } from '../states/needsToRefresh';
import { FIELD_TYPES_OBJECT } from '../constants/fieldTypes';

export const PropertyEdit = () => {
  const { groupId, id, type } = useParams<{
    groupId: string;
    id: string;
    type: string;
  }>();

  const { fieldDetail, loading } = useFieldDetail({ id: id || '' });
  const { editProperty, loading: editPropertyLoading } = useEditProperty();
  const setNeedsToRefresh = useSetAtom(needsToRefreshState);

  const navigate = useNavigate();

  const [fieldType, ...relationType] = fieldDetail?.type?.split(':') || [];

const handleSubmit = (data: IPropertyForm) => {
  const finalType =
    data.type === FIELD_TYPES_OBJECT.relation.value && data.relationType
      ? `relation:${data.relationType}`
      : data.type;

  editProperty({
    variables: {
      id,
      groupId,
      contentType: type,
      ...data,
      type: finalType,
    },
    onCompleted: () => {
      navigate(`/settings/properties/${type}`);
      setNeedsToRefresh(true);
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
        icon: fieldDetail?.icon ?? '123',
        type: fieldType,
        relationType: relationType.join(':'),
      }}
      isEdit
    />
  );
};
