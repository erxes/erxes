import { SearchIntegration } from './SearchIntegration';
import { Label } from 'erxes-ui';
import { Integration } from './Integration';
import { useIntegrationContext } from '../hooks/useIntegrationContext';

export const MainSettingsForm = () => {
  const { integrations, otherIntegrations } = useIntegrationContext();
  return (
    <form className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">Integrations</h1>
        <span className="font-normal text-muted-foreground text-sm">
          Set up your integrations and start connecting with your customers
        </span>
      </div>
      <SearchIntegration />
      <div>
        <Label>Customer experience</Label>
        <div className="grid grid-cols-3 gap-3 mt-3 auto-rows-fr">
          {Object.entries(integrations).map(([key, value]) => (
            <Integration
              key={key}
              to={key}
              label={value.label}
              description={value.description}
              img={value.img}
            />
          ))}
        </div>
      </div>
      <div>
        <Label>Other</Label>
        <div className="grid grid-cols-3 gap-3 mt-3 auto-rows-fr">
          {Object.entries(otherIntegrations).map(([key, value]) => (
            <Integration
              key={key}
              to={key}
              label={value.label}
              description={value.description}
              img={value.img}
            />
          ))}
        </div>
      </div>
    </form>
  );
};
