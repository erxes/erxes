import { Form } from 'erxes-ui';
import { AutomationTriggerFormProps } from 'ui-modules';
import { useCommentTriggerForm } from '../../hooks/useCommentTriggerForm';
import { TCommentTriggerForm } from '../../types/commentTrigger';
import { CommentTriggerFilters } from './CommentTriggerFilters';

export const CommentTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps<TCommentTriggerForm>) => {
  const { form, botId, checkContent, postType } = useCommentTriggerForm({
    formRef,
    activeTrigger,
    onSaveTriggerConfig,
  });

  return (
    <div className="h-full w-2xl">
      <Form {...form}>
        <CommentTriggerFilters
          control={form.control}
          botId={botId}
          postType={postType}
          checkContent={checkContent}
        />
      </Form>
    </div>
  );
};
