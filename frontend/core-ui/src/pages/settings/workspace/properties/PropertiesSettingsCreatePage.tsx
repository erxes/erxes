import { AddProperty } from '@/properties/components/PropertyAdd';
import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { useNavigate, useParams } from 'react-router-dom';

export const PropertiesSettingsCreatePage = () => {
  const { basePath } = usePropertiesScope();
  const { groupId, type } = useParams<{ groupId: string; type: string }>();
  const navigate = useNavigate();

  return (
    <AddProperty
      contentType={type || ''}
      groupId={groupId}
      onClose={() => navigate(`${basePath}/${type}`)}
    />
  );
};
