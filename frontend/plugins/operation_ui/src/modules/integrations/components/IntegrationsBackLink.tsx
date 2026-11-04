import { IconChevronLeft } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { INTEGRATIONS_PATH } from '../constants';

export const IntegrationsBackLink = () => (
  <Button variant="ghost" className="-ml-2 text-muted-foreground" asChild>
    <Link to={INTEGRATIONS_PATH}>
      <IconChevronLeft />
      Integrations
    </Link>
  </Button>
);
