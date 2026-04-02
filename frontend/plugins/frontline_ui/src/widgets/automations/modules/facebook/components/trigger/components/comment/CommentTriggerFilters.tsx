import { cn, Form, Select, Switch } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { FacebookPostSelector } from '~/widgets/automations/modules/facebook/components/FacebookPostSelector';
import { FacebookBotSelector } from '~/widgets/automations/modules/facebook/components/MessengerBotSelector';
import { COMMENT_POST_TYPES } from '../../constants/commentTriggerOptions';
import { TCommentTriggerForm } from '../../types/commentTrigger';
import { DirectMessageEditor } from '../message/DirectMessageEditor';

type Props = {
  control: Control<TCommentTriggerForm>;
  botId: string;
  postType: TCommentTriggerForm['postType'];
  checkContent?: boolean;
};

export const CommentTriggerFilters = ({
  control,
  botId,
  postType,
  checkContent,
}: Props) => {
  return (
    <>
      <Form.Field
        control={control}
        name="botId"
        render={({ field }) => (
          <FacebookBotSelector botId={field.value} onSelect={field.onChange} />
        )}
      />

      <div className={cn('flex flex-col gap-2 p-4', { blur: !botId })}>
        <Form.Field
          control={control}
          name="postType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Type</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {COMMENT_POST_TYPES.map(({ label, value }) => (
                      <Select.Item key={value} value={value}>
                        {label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />

        {postType === 'specific' ? (
          <Form.Field
            control={control}
            name="postId"
            render={({ field }) => (
              <Form.Item>
                <FacebookPostSelector
                  botId={botId}
                  selectedPostId={field.value}
                  onSelect={field.onChange}
                />
              </Form.Item>
            )}
          />
        ) : null}

        <Form.Field
          control={control}
          name="onlyFirstLevel"
          render={({ field }) => (
            <Form.Item className="flex items-center justify-between">
              <Form.Label>Track first level comments only</Form.Label>
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="checkContent"
          render={({ field }) => (
            <Form.Item className="flex items-center justify-between">
              <Form.Label>Check comment text contains with keywords</Form.Label>
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        {checkContent ? (
          <Form.Field
            control={control}
            name="conditions"
            render={({ field }) => (
              <DirectMessageEditor
                conditions={field.value || []}
                onConditionChange={(_, values) => field.onChange(values)}
              />
            )}
          />
        ) : null}
      </div>
    </>
  );
};
