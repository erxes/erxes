import { Badge, cn } from 'erxes-ui';

type TProps = {
  step: number;
  integration: {
    img: string;
    label: string;
    description: string;
    steps: {
      id: number;
      name: string;
      description: string;
      isFinal: boolean;
      isEmpty?: {
        name: string;
        description: string;
      };
    }[];
  };
  isEmpty?: boolean;
};

const IntegrationSteps = ({ step, integration, isEmpty }: TProps) => {
  return (
    <div className="p-5 flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <Badge className="rounded-xl text-xs font-mono">STEP {step + 1}</Badge>
        <span className="text-base text-primary font-semibold">
          {(isEmpty && integration.steps[step]?.isEmpty?.name) ||
            integration.steps[step].name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {integration.steps.map((item) => (
          <div
            key={item.id}
            className={cn(
              step === item.id ? 'bg-primary' : 'bg-muted',
              'h-1 w-16 rounded-full',
            )}
          />
        ))}
      </div>
      <div className="text-xs text-accent-foreground">
        {(isEmpty && integration.steps[step]?.isEmpty?.description) ||
          integration.steps[step]?.description}
      </div>
    </div>
  );
};

export default IntegrationSteps;
