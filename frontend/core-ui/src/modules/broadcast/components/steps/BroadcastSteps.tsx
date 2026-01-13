import { useBroadcastAdd } from '@/broadcast/hooks/useBroadcastAdd';
import { useBroadcastForm } from '@/broadcast/hooks/useBroadcastForm';
import {
  Badge,
  Button,
  cn,
  Resizable,
  Separator,
  Sheet,
  useQueryState,
  useRemoveQueryStateByKey,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { BROADCAST_MESSAGE_METHOD_KINDS } from '../../constants';
import { BroadcastPreview } from '../BroadcastPreview';
import { BroadcastConfigStep } from './BroadcastConfigStep';
import { BroadcastTargetStep } from './BroadcastTargetStep';

const BROADCAST_STEPS = [
  {
    title: 'Broadcast recipients',
    description: 'Segment who’s going to receive this broacast',
    content: BroadcastTargetStep,
    validateFields: ['title', 'targetType', 'targetIds'],
  },
  {
    title: 'Broadcast Config',
    description: 'Configure, Write and Compose your broadcast',
    content: BroadcastConfigStep,
    validateFields: ['fromUserId', 'email.subject', 'email.content'],
  },
];

export const BroadcastSteps = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const [method] = useQueryState<string>('method');
  const removeQueryStateByKey = useRemoveQueryStateByKey();
  const { toast } = useToast();

  const { form } = useBroadcastForm();

  const { addBroadcast } = useBroadcastAdd();

  const [step, setStep] = useState(0);

  const handleClose = () => {
    setOpen(false);

    removeQueryStateByKey('method');
  };

  const onSubmit = (data: any, action?: 'draft' | 'live') => {
    if (action === 'draft') {
      data['isDraft'] = true;
    }

    if (action === 'live') {
      data['isLive'] = true;
    }

    if (method) {
      data['method'] = method;
      data['kind'] = BROADCAST_MESSAGE_METHOD_KINDS[method];
    }

    addBroadcast({
      variables: data,
      onCompleted: () => {
        toast({
          variant: 'default',
          title:
            action === 'draft'
              ? 'Broadcast saved as draft'
              : 'Broadcast created',
        });
      },
    });
  };

  const handleAction = async (step: number, action?: 'draft' | 'live') => {
    if (step < 0) {
      handleClose();
    }

    const currentStep = BROADCAST_STEPS[step - 1];

    if (currentStep && currentStep.validateFields) {
      const isValid = await form.trigger(currentStep.validateFields as any);

      if (!isValid) {
        return;
      }
    }

    if (step > BROADCAST_STEPS.length - 1) {
      form.handleSubmit((data) => onSubmit(data, action))();
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

  const { title, description, content: StepContent } = BROADCAST_STEP;

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
  handleAction: (step: number, action?: 'draft' | 'live') => void;
}) => {
  return (
    <Sheet.Footer>
      <Button onClick={() => handleAction(step - 1)} variant="secondary">
        {step === 0 ? 'Cancel' : 'Previous step'}
      </Button>
      {step + 1 === BROADCAST_STEPS.length && (
        <Button onClick={() => handleAction(step + 1, 'draft')}>
          Save & Draft
        </Button>
      )}
      <Button onClick={() => handleAction(step + 1, 'live')}>
        {step + 1 === BROADCAST_STEPS.length ? 'Save & Live' : 'Next step'}
      </Button>
    </Sheet.Footer>
  );
};
