import { useTranslation } from 'react-i18next';
import { PropertiesEmbeddedSettings } from '@/properties/components/PropertiesEmbeddedSettings';
import { STRUCTURE_PROPERTIES_CONTENT_TYPE } from '../../constants/structureCapabilities';

export const StructureEntityTypeFieldsTab = ({
  typeId,
}: {
  typeId: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <div className="flex flex-col gap-3 py-4">
      <p className="text-sm text-muted-foreground">
        {t('custom-fields-description')}
      </p>
      <PropertiesEmbeddedSettings
        contentType={STRUCTURE_PROPERTIES_CONTENT_TYPE}
        contentTypeId={typeId}
      />
    </div>
  );
};
