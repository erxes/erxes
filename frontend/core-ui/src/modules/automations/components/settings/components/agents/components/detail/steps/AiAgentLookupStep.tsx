import { AiAgentStepNotice } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepNotice';
import { useAiAgentLookups } from '@/automations/components/settings/components/agents/hooks/useAiAgentLookups';
import { Card, Spinner, Switch } from 'erxes-ui';

export const AiAgentLookupStep = () => {
  const { options, selected, toggleLookup, loading, error } =
    useAiAgentLookups();

  return (
    <div className="grid gap-4">
      <AiAgentStepNotice step="lookup" />
      <p className="text-sm text-muted-foreground">
        A lookup reads a record as it is now: the customer's own, such as an
        order, or shared data, such as stock. A customer's record is only ever
        the one of the customer the agent is talking to, and only the fields
        the record type allows are shown.
      </p>
      <Card className="divide-y">
        {loading && (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        )}
        {!loading && error && (
          <p className="p-4 text-sm text-destructive">
            Couldn't load the lookups. Reload the page to try again.
          </p>
        )}
        {!loading && !error && !options.length && (
          <p className="p-4 text-sm text-muted-foreground">
            No record type offers a lookup yet.
          </p>
        )}
        {options.map((option) => (
          <div
            key={option.objectType}
            className="flex items-start justify-between gap-4 p-4"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Switch
              checked={selected.includes(option.objectType)}
              aria-label={option.label}
              onCheckedChange={(checked) =>
                toggleLookup(option.objectType, checked)
              }
            />
          </div>
        ))}
      </Card>
    </div>
  );
};
