import { IconSandbox, IconShieldCheck, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { GenericHeader } from '../shared';

interface InsuranceTypesHeaderProps {
  onCreateClick?: () => void;
}

export const InsuranceTypesHeader = ({
  onCreateClick,
}: InsuranceTypesHeaderProps) => {
  return (
    <GenericHeader
      icon={<IconShieldCheck />}
      parentIcon={<IconSandbox />}
      parentLabel="Insurance"
      parentLink="/insurance/products"
      currentLabel="Insurance Types"
      actions={
        <Button onClick={onCreateClick}>
          <IconPlus size={16} />
          New Insurance Type
        </Button>
      }
    />
  );
};
