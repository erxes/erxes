import {
  Button,
  Collapsible,
  Skeleton,
  TextOverflowTooltip,
  useMultiQueryState,
} from 'erxes-ui';
import { useIntegrations } from '@/integrations/hooks/useIntegrations';
import { useAtom } from 'jotai';
import { integrationCollapsibleState } from '@/integrations/state/integrationCollapsibleState';
import { IIntegration } from '@/integrations/types/Integration';
import { IconCheck } from '@tabler/icons-react';

// TODO: remove this component if we not use it

export const ChooseIntegration = () => {
  const [open, setOpen] = useAtom(integrationCollapsibleState);

  return (
    <Collapsible
      className="group/integration"
      open={open}
      onOpenChange={setOpen}
    >
      <Collapsible.TriggerButton>
        <Collapsible.TriggerIcon className="group-data-[state=open]/integration:rotate-180" />
        Integrations
      </Collapsible.TriggerButton>
      <Collapsible.Content className="pl-1 flex flex-col gap-1 py-1 overflow-hidden">
        <ChooseIntegrationContent open={open} />
      </Collapsible.Content>
    </Collapsible>
  );
};

const ChooseIntegrationContent = ({ open }: { open: boolean }) => {
  const { integrations, loading } = useIntegrations({
    variables: {
      only: 'byIntegrationTypes',
      limit: 20,
    },
    skip: !open,
  });

  if (loading)
    return (
      <>
        <Skeleton className="w-32 h-4 mt-1" />
        <Skeleton className="w-36 h-4 mt-1" />
        <Skeleton className="w-32 h-4 mt-1" />
      </>
    );

  if (integrations?.length === 0) return null;

  return integrations?.map((integration: IIntegration) => (
    <IntegrationItem key={integration._id} {...integration} />
  ));
};

const IntegrationItem = ({ _id, name }: IIntegration) => {
  const [{ integrationType }, setValues] = useMultiQueryState<{
    integrationType: string;
  }>(['integrationType']);

  const isActive = integrationType === _id;

  const handleClick = () =>
    setValues({
      integrationType: _id,
    });

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start pl-7 relative overflow-hidden text-left flex-auto"
      onClick={handleClick}
    >
      {isActive && <IconCheck className="absolute left-1.5" />}
      <TextOverflowTooltip value={name} className="flex-auto" />
      <span className="ml-auto text-xs text-accent-foreground">{0}</span>
    </Button>
  );
};
