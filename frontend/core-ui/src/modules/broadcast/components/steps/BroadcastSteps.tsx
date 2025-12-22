import { useBroadcastForm } from '@/broadcast/hooks/useBroadcastForm';
import {
  Badge,
  Button,
  cn,
  Resizable,
  Separator,
  Sheet,
  toast,
  useRemoveQueryStateByKey,
} from 'erxes-ui';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { BroadcastPreview } from '../BroadcastPreview';
import { BroadcastConfigStep } from './BroadcastConfigStep';
import { BroadcastTargetStep } from './BroadcastTargetStep';

const BROADCAST_STEPS = [
  {
    title: 'Broadcast recipients',
    description: 'Segment who’s going to receive this broacast',
    content: BroadcastTargetStep,
  },
  {
    title: 'Broadcast Config',
    description: 'Configure, Write and Compose your broadcast',
    content: BroadcastConfigStep,
  },
];

export const BroadcastSteps = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const removeQueryStateByKey = useRemoveQueryStateByKey();
  const { form } = useBroadcastForm();

  const [step, setStep] = useState(0);

  const handleClose = () => {
    setOpen(false);

    removeQueryStateByKey('method');
  };

  const handleSubmit = () => {
    toast({
      variant: 'default',
      title: 'Broadcast created',
    });
  };

  const handleAction = (step: number) => {
    if (step < 0) {
      handleClose();
    }

    if (step > BROADCAST_STEPS.length - 1) {
      handleSubmit();
      handleClose();
    }

    setStep(step);
  };

  return (
    <FormProvider {...form}>
      <Sheet.Header>
        <Sheet.Title>New Broadcast</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>

      <Resizable.PanelGroup direction="horizontal" className="bg-blue">
        <Resizable.Panel
          className="flex flex-col"
          defaultSize={40}
          minSize={35}
        >
          <Sheet.Content className="grow overflow-hidden flex flex-col">
            {BROADCAST_STEPS.map(
              (_, index) =>
                index === step && <BroadcastStep key={index} step={step} />,
            )}
          </Sheet.Content>
          <BroadcastStepActions step={step} handleAction={handleAction} />
        </Resizable.Panel>

        <Resizable.Handle />
        <Resizable.Panel
          className="flex flex-col h-full"
          defaultSize={60}
          minSize={60}
        >
          <BroadcastPreview />
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </FormProvider>
  );
};

export const BroadcastStep = ({ step }: { step: number }) => {
  const BROADCAST_STEP = BROADCAST_STEPS[step];

  const { title, description, content } = BROADCAST_STEP;

  const StepContent = content;

  return (
    <>
      <div className="p-5 flex flex-col gap-5 h-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge className="rounded-xl text-xs font-mono">
              STEP {step + 1}/{BROADCAST_STEPS.length}
            </Badge>
            <h2 className="text-primary font-semibold text-base">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: BROADCAST_STEPS.length }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-full bg-muted',
                  step === index + 1 && 'bg-primary',
                )}
              />
            ))}
          </div>
          <div className="text-xs text-accent-foreground">{description}</div>
        </div>
        <Separator />
        <StepContent />
      </div>
    </>
  );
};

export const BroadcastStepActions = ({
  step,
  handleAction,
}: {
  step: number;
  handleAction: (step: number) => void;
}) => {
  return (
    <Sheet.Footer>
      <Button onClick={() => handleAction(step - 1)} variant="secondary">
        {step === 0 ? 'Cancel' : 'Previous step'}
      </Button>
      <Button onClick={() => handleAction(step + 1)}>
        {step + 1 === BROADCAST_STEPS.length ? 'Finish' : 'Next step'}
      </Button>
    </Sheet.Footer>
  );
};
