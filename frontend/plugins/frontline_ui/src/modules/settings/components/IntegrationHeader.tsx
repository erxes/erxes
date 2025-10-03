import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, useQueryState } from 'erxes-ui';
import { IconBox, IconPlus } from '@tabler/icons-react';
import { INTEGRATIONS, OTHER_INTEGRATIONS } from '../constants/integrations';
import { AddIntegration } from './add-integration/AddIntegration';

export const IntegrationHeader = () => {
  // const [kind] = useQueryState<string>('kind')
  const params = useParams();
  const integrations = { ...INTEGRATIONS, ...OTHER_INTEGRATIONS };
  const integration = integrations[params.kind as keyof typeof integrations];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 items-center">
        <span className="flex items-center justify-center w-8 h-8 p-1 rounded-sm shadow-sm relative">
          <img
            alt={params.kind}
            src={`http://localhost:3002${integration.img}`}
            className="w-full h-full object-contain"
          />
        </span>
        <div className="flex flex-col gap-1">
          {integration ? (
            <strong>{integration.label}</strong>
          ) : (
            <span className="text-muted-foreground text-sm">
              Unknown integration
            </span>
          )}
          <div className="text-accent-foreground text-sm">
            {integration?.description || 'N/A'}
          </div>
        </div>
      </div>
      <AddIntegration>
        <Button className="px-2 w-min">
          <IconPlus size={16} />
          Add {integration.label || 'Integration'}
        </Button>
      </AddIntegration>
    </div>
  );
};
