import React from 'react';
import { Button } from 'erxes-ui';
import { IconChevronLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { IntegrationHeader } from './IntegrationHeader';
import { IntegrationsList } from './IntegrationsList';

export const IntegrationSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl flex flex-col gap-8 h-full w-full mx-auto px-5">
      <div className="py-4">
        <Button
          variant="ghost"
          className="text-muted-foreground pl-0"
          onClick={() => navigate(-1)}
        >
          <IconChevronLeft />
          Integrations
        </Button>
      </div>
      <IntegrationHeader />
      <IntegrationsList />
    </div>
  );
};
