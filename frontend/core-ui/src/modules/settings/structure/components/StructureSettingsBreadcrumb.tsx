import { IconHierarchy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { STRUCTURE_SETTINGS_PATH } from '../constants/structureCapabilities';

export const StructureSettingsBreadcrumb = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <Button variant="ghost" asChild>
      <Link to={STRUCTURE_SETTINGS_PATH}>
        <IconHierarchy />
        {t('structure')}
      </Link>
    </Button>
  );
};
