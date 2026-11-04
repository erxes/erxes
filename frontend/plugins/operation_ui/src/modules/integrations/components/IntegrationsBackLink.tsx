import { IconArrowLeft } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { INTEGRATIONS_PATH } from '../constants';

export const IntegrationsBackLink = () => (
  <Button
    variant="ghost"
    size="sm"
    className="-ml-2 mb-2 text-muted-foreground"
    asChild
  >
    <Link to={INTEGRATIONS_PATH}>
      <IconArrowLeft className="size-4" />
      Integrations
    </Link>
  </Button>
);
