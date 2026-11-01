import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

// folded away until asked for: without a reply-to, replies go to the From
export const useBroadcastReplyTo = () => {
  const { control, setValue } = useFormContext();
  const [replyTo, fromEmail] = useWatch({
    control,
    name: ['email.replyTo', 'fromEmail'],
  });
  const [asked, setAsked] = useState(false);

  const clear = () => {
    setValue('email.replyTo', '', { shouldDirty: true, shouldValidate: true });
    setAsked(false);
  };

  return {
    open: asked || !!replyTo,
    ask: () => setAsked(true),
    clear,
    fromEmail: (fromEmail as string | undefined) || '',
  };
};
