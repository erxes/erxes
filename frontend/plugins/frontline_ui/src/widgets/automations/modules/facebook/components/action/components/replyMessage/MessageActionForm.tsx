import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import {
  AutomationActionFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { getMaxMessagesForTrigger } from '~/widgets/automations/modules/facebook/components/action/constants/ReplyMessage';
import { FacebookMessages } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/FacebookMessages';
import { MessageSequenceHeader } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/MessageSequenceHeader';
import { ReplyMessageProvider } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';

import {
  replyMessageFormSchema,
  TMessageActionForm,
} from '~/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm';

export const MessageActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
  trigger,
}: AutomationActionFormProps<TMessageActionForm>) => {
  const form = useForm<TMessageActionForm>({
    resolver: zodResolver(replyMessageFormSchema),
    defaultValues: { ...(currentAction?.config || {}) },
  });
  const { handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Message Action Form',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveActionConfig, handleValidationErrors)(),
  });

  return (
    <ReplyMessageProvider
      form={form}
      maxMessages={getMaxMessagesForTrigger(trigger?.type)}
    >
      <div className="w-[600px]">
        <MessageSequenceHeader />
        <FacebookMessages />
      </div>
    </ReplyMessageProvider>
  );
};
