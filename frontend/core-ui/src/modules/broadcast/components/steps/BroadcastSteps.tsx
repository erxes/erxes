import { IBroadcastMethodEnum } from '@/broadcast/types';
import { useBroadcastAdd } from '@/broadcast/hooks/useBroadcastAdd';
import { useBroadcastEdit } from '@/broadcast/hooks/useBroadcastEdit';
import {
  IBroadcastFormData,
  useBroadcastForm,
} from '@/broadcast/hooks/useBroadcastForm';
import {
  Badge,
  Button,
  cn,
  Resizable,
  Separator,
  Sheet,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import {
  prepareBroadcastVariables,
  TBroadcastAction,
} from '../../utils/prepareBroadcastVariables';
import { useBroadcastSchedule } from '../../hooks/useBroadcastSchedule';
import {
  isScheduleReady,
  TBroadcastScheduleForm,
} from '../../utils/scheduleForm';
import { BroadcastScheduleField } from './BroadcastScheduleField';
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
    validateFields: [
      'fromEmail',
      'email.subject',
      'email.replyTo',
      'email.content',
    ],
  },
];

const getConfigValidateFields = (method?: string | null) => {
  // A workflow campaign carries no content of its own: the flow is drawn in
  // the automation builder after the campaign exists.
  if (method === 'workflow') {
    return [];
  }

  if (method === 'notification') {
    return ['cpId', 'notification.title', 'notification.content'];
  }

  if (method === 'messenger') {
    return [
      'fromUserId',
      'messenger.brandId',
      'messenger.content',
      'messenger.sentAs',
      'messenger.kind',
    ];
  }

  return ['fromEmail', 'email.subject', 'email.replyTo', 'email.content'];
};

/**
 * @param messageId set when an existing campaign is being edited: the same
 * steps, saved through the edit mutation instead of creating a second
 * campaign.
 */
export const BroadcastSteps = ({
  messageId,
  initialValues,
  onClose,
}: {
  messageId?: string;
  initialValues?: Partial<IBroadcastFormData>;
  onClose: () => void;
}) => {
  const [method] = useQueryState<IBroadcastMethodEnum>('method');
  const { toast } = useToast();

  const { form } = useBroadcastForm(initialValues);
  // The canvas is the campaign's content, so it takes most of the split.
  const isWorkflow = method === IBroadcastMethodEnum.WORKFLOW;

  const { addBroadcast } = useBroadcastAdd();
  const { editBroadcast } = useBroadcastEdit();
  const { setSchedule } = useBroadcastSchedule();

  const [step, setStep] = useState(0);

  const handleClose = () => onClose();

  const fail = (title: string) => (error: Error) =>
    toast({
      variant: 'destructive',
      title,
      description: error.message,
    });

  // A moment can only be set on a campaign that exists, so scheduling happens
  // after the save rather than as part of it. A campaign saved but not
  // scheduled stays a draft, which is the recoverable half of the pair.
  const scheduleSaved = (_id: string, schedule: TBroadcastScheduleForm) =>
    setSchedule(_id, schedule, {
      onError: fail('Saved as a draft, but could not be scheduled'),
      onCompleted: () =>
        toast({
          variant: 'default',
          title: 'Broadcast scheduled',
        }),
    });

  const onSubmit = (data: any, action?: TBroadcastAction) => {
    if (!method) {
      return;
    }

    const schedule =
      action === 'schedule'
        ? (data.schedule as TBroadcastScheduleForm | undefined)
        : undefined;
    const variables = prepareBroadcastVariables(data, method, action);

    const announce = () =>
      toast({
        variant: 'default',
        title: messageId
          ? 'Broadcast saved'
          : action === 'draft'
          ? 'Broadcast saved as draft'
          : 'Broadcast created',
      });

    const onError = fail('Could not save this broadcast');

    if (messageId) {
      editBroadcast({
        variables: { _id: messageId, ...variables },
        onError,
        onCompleted: () =>
          schedule ? scheduleSaved(messageId, schedule) : announce(),
      });
      return;
    }

    addBroadcast({
      variables,
      onError,
      onCompleted: (created: { engageMessageAdd?: { _id: string } }) => {
        const _id = created?.engageMessageAdd?._id;

        if (schedule && _id) {
          scheduleSaved(_id, schedule);
          return;
        }

        announce();
      },
    });
  };

  const handleAction = async (step: number, action?: TBroadcastAction) => {
    if (step < 0) {
      handleClose();
    }

    const currentStep = BROADCAST_STEPS[step - 1];
    const validateFields =
      step - 1 === 1
        ? getConfigValidateFields(method)
        : currentStep?.validateFields;

    if (validateFields) {
      const isValid = await form.trigger(validateFields as any);

      if (!isValid) {
        return;
      }
    }

    if (method === 'notification' && step - 1 === 1) {
      const notification = form.getValues('notification');

      if (!notification?.inApp && !notification?.isMobile) {
        toast({
          variant: 'destructive',
          title: 'Select a notification channel',
          description:
            'Enable in-app or mobile & web push before saving the campaign.',
        });

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
        <Sheet.Title>
          {messageId ? 'Edit Broadcast' : 'New Broadcast'}
        </Sheet.Title>
        <div className="ml-auto mr-2 flex items-center gap-2">
          <BroadcastScheduleField />
        </div>
        <Sheet.Close />
      </Sheet.Header>

      {/* Keyed by method: panel sizes are read once on mount, and the sheet
          can open in the same tick the method lands in the query string. */}
      <Resizable.PanelGroup
        key={method || 'default'}
        direction="horizontal"
        className="bg-blue"
      >
        <Resizable.Panel
          className="flex flex-col"
          defaultSize={isWorkflow ? 26 : 40}
          minSize={isWorkflow ? 20 : 35}
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
          defaultSize={isWorkflow ? 74 : 60}
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
  handleAction: (step: number, action?: TBroadcastAction) => void;
}) => {
  const form = useFormContext<IBroadcastFormData>();

  const isLastStep = step + 1 === BROADCAST_STEPS.length;
  // The header decides what this button does: a moment picked there turns the
  // send into a schedule, so there is never a choice to make down here.
  const isScheduled = isScheduleReady(
    form.watch('schedule') as TBroadcastScheduleForm | undefined,
  );

  return (
    <Sheet.Footer>
      <Button onClick={() => handleAction(step - 1)} variant="secondary">
        {step === 0 ? 'Cancel' : 'Previous step'}
      </Button>
      {isLastStep && (
        <Button
          onClick={() => handleAction(step + 1, 'draft')}
          variant="secondary"
        >
          Save & Draft
        </Button>
      )}
      <Button
        onClick={() =>
          handleAction(step + 1, isScheduled ? 'schedule' : 'live')
        }
      >
        {!isLastStep
          ? 'Next step'
          : isScheduled
          ? 'Save & Schedule'
          : 'Save & Live'}
      </Button>
    </Sheet.Footer>
  );
};
