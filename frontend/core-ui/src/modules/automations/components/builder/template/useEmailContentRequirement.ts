import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

export type TEmailContentAnswer = Pick<
  TAutomationSendEmailConfig,
  'subject' | 'content' | 'contentJson' | 'contentFormat' | 'html'
>;

const toAnswer = (values: Partial<TAutomationSendEmailConfig>) => ({
  subject: values.subject || '',
  content: values.content || '',
  contentJson: values.contentJson,
  contentFormat: values.contentFormat,
  // The email editor writes its html into `content`; keep the fallback equal
  html:
    values.contentFormat === 'maily' ? values.content || '' : values.html || '',
});

/**
 * The email step's wording in a form of its own, so the builder's editor runs
 * unchanged. Nothing is answered until "use" is pressed, and any later edit
 * takes the answer back until it is used again.
 */
export const useEmailContentRequirement = ({
  value,
  defaultValue,
  onChange,
}: {
  value: unknown;
  defaultValue?: Partial<TEmailContentAnswer>;
  onChange: (value: TEmailContentAnswer | null) => void;
}) => {
  const answered = (value as TEmailContentAnswer | null) || undefined;
  const form = useForm<TAutomationSendEmailConfig>({
    defaultValues: (answered ||
      defaultValue ||
      {}) as Partial<TAutomationSendEmailConfig>,
  });
  // What was used, compared so a re-render of the same email keeps it
  const usedSnapshot = useRef(answered ? JSON.stringify(answered) : '');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (
        usedSnapshot.current &&
        JSON.stringify(toAnswer(values)) !== usedSnapshot.current
      ) {
        usedSnapshot.current = '';
        onChangeRef.current(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const use = () => {
    const answer = toAnswer(form.getValues());

    if (!answer.subject.trim() || !(answer.content || answer.contentJson)) {
      return;
    }

    usedSnapshot.current = JSON.stringify(answer);
    onChangeRef.current(answer);
  };

  const subject = form.watch('subject') || '';
  const content = form.watch('content') || '';
  const contentJson = form.watch('contentJson');

  return {
    form,
    subject,
    content,
    canUse: !!subject.trim() && !!(content || contentJson),
    isUsed: !!answered,
    use,
  };
};
