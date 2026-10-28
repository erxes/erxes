import { PropertyEdit } from '@/properties/components/PropertyEdit';
import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { useNavigate, useParams } from 'react-router-dom';

export const PropertiesSettingEditPage = () => {
  const { basePath } = usePropertiesScope();
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();

  return (
    <PropertyEdit
      contentType={type || ''}
      fieldId={id || ''}
      onClose={() => navigate(`${basePath}/${type}`)}
    />
  );
};
