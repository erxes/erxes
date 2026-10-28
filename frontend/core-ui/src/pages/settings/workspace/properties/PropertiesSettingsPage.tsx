import { PropertyFieldsGroupSettings } from '@/properties/components/PropertyFieldsGroupSettings';
import { useParams } from 'react-router-dom';

export function PropertiesSettingsPage() {
  const { type } = useParams<{ type: string }>();

  return <PropertyFieldsGroupSettings contentType={type || ''} />;
}
