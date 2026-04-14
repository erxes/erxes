import { IconSandbox, IconAlertTriangle, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { GenericHeader } from '../shared';

interface RisksHeaderProps {
  onCreateClick: () => void;
}

export const RisksHeader = ({ onCreateClick }: RisksHeaderProps) => {
  return (
    <GenericHeader
      icon={<IconAlertTriangle />}
      parentIcon={<IconSandbox />}
      parentLabel="Insurance"
      parentLink="/insurance/products"
      currentLabel="Risk Types"
      actions={
        <Button onClick={onCreateClick}>
          <IconPlus size={16} />
          New Risk Type
        </Button>
      }
    />
  );
};
