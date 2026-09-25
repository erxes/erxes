import { Path } from 'react-hook-form';
import { IBroadcastFormData } from '../../hooks/useBroadcastForm';
import { BroadcastConfigStep } from './BroadcastConfigStep';
import { BroadcastTargetStep } from './BroadcastTargetStep';

type TBroadcastField = Path<IBroadcastFormData>;

export const BROADCAST_STEPS = [
  {
    titleKey: 'steps.recipients',
    descriptionKey: 'steps.recipients-body',
    content: BroadcastTargetStep,
  },
  {
    titleKey: 'steps.config',
    descriptionKey: 'steps.config-body',
    content: BroadcastConfigStep,
  },
];

export const BROADCAST_CONFIG_STEP = 1;

const TARGET_FIELDS: TBroadcastField[] = ['title', 'targetType', 'targetIds'];

const configFields = (method?: string | null): TBroadcastField[] => {
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

  return ['fromEmail', 'email.subject', 'email.replyTo', 'email.contentJson'];
};

/** What has to be valid before leaving a step. */
export const stepFields = (
  step: number,
  method?: string | null,
): TBroadcastField[] =>
  step === BROADCAST_CONFIG_STEP ? configFields(method) : TARGET_FIELDS;
