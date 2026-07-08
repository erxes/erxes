import { IconSandbox, IconShieldCheck, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GenericHeader } from '../shared';

interface InsuranceTypesHeaderProps {
  onCreateClick?: () => void;
}

export const InsuranceTypesHeader = ({
  onCreateClick,
}: InsuranceTypesHeaderProps) => {
  const { t } = useTranslation('insurance');
  return (
    <GenericHeader
      icon={<IconShieldCheck />}
      parentIcon={<IconSandbox />}
      parentLabel={t('insurance')}
      parentLink="/insurance/products"
      currentLabel={t('insurance-types')}
      actions={
        <Button onClick={onCreateClick}>
          <IconPlus size={16} />
          {t('new-insurance-type')}
        </Button>
      }
    />
  );
};
