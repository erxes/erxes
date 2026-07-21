import { IconSandbox, IconAlertTriangle, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GenericHeader } from '../shared';

interface RisksHeaderProps {
  onCreateClick: () => void;
}

export const RisksHeader = ({ onCreateClick }: RisksHeaderProps) => {
  const { t } = useTranslation('insurance');
  return (
    <GenericHeader
      icon={<IconAlertTriangle />}
      parentIcon={<IconSandbox />}
      parentLabel={t('insurance', 'Insurance')}
      parentLink="/insurance/products"
      currentLabel={t('risk-types', 'Risk Types')}
      actions={
        <Button onClick={onCreateClick}>
          <IconPlus size={16} />
          {t('new-risk-type', 'New Risk Type')}
        </Button>
      }
    />
  );
};
