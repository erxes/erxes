import { PropertyFieldsGroupSettings } from '@/properties/components/PropertyFieldsGroupSettings';
import { useQueryState } from 'erxes-ui';
import { useFieldGroups } from '../hooks/useFieldGroups';

export const PropertiesSettings = () => {
  const [type] = useQueryState<string>('type');
  const { fieldGroups, loading } = useFieldGroups({ contentType: type || '' });
  return <PropertyFieldsGroupSettings />;
};
