import {
  Combobox,
  Command,
  Filter,
  Popover,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useUsedIntegrationTypes } from '../hooks/useUsedIntegrationTypes';
import { IIntegrationType } from '../types/Integration';

export const IntegrationTypeTag = () => {
  const [integrationTypeId, setIntegrationTypeId] =
    useQueryState<string>('integrationType');
  const { integrationTypes, loading } = useUsedIntegrationTypes();

  const integrationType = integrationTypes?.find(
    (integrationType: IIntegrationType) =>
      integrationType._id === integrationTypeId,
  );

  if (!integrationType) return null;

  if (loading) {
    return <Skeleton className="w-20 h-4" />;
  }

  return (
    <Filter.BarItem queryKey="integrationType">
      <Popover>
        <Popover.Trigger asChild>
          <Filter.BarButton className="rounded-l">
            {integrationType.name}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.Input placeholder="Select integration" />
            <Command.List>
              {integrationTypes?.map((integrationType: IIntegrationType) => (
                <Command.Item
                  value={integrationType._id}
                  key={integrationType._id}
                  onSelect={() => setIntegrationTypeId(integrationType._id)}
                >
                  <TextOverflowTooltip value={integrationType.name} />
                  <Combobox.Check
                    checked={integrationType._id === integrationTypeId}
                  />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
