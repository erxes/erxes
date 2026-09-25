import { Form, Select, Switch, cn } from 'erxes-ui';

import { AutomationTriggerFormProps } from 'ui-modules';
import { COMMENT_POST_TYPES } from '../../constants/commentTriggerOptions';
import { useCommentTriggerForm } from '../../hooks/useCommentTriggerForm';
import { useFacebookCommentTriggerClaims } from '../../hooks/useFacebookCommentTriggerClaims';
import { TriggerClaimNote } from '../message/TriggerClaimNote';
import { TCommentTriggerForm } from '../../types/commentTrigger';
import { DirectMessageEditor } from '../message/DirectMessageEditor';
import { FacebookBotSelector } from '~/widgets/automations/modules/facebook/components/MessengerBotSelector';
import { FacebookPostSelector } from '~/widgets/automations/modules/facebook/components/FacebookPostSelector';
import { useTranslation } from 'react-i18next';
export const CommentTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps<TCommentTriggerForm>) => {
  const { t } = useTranslation('frontline');
  const { form, botId, checkContent, postType } = useCommentTriggerForm({
    formRef,
    activeTrigger,
    onSaveTriggerConfig,
  });
  const { control } = form;
  const postId = form.watch('postId');
  const { claims } = useFacebookCommentTriggerClaims(botId, activeTrigger?.id);
  // A wider rule elsewhere cannot be avoided from here, so only the identical
  // scope is called out as a duplicate.
  const scopeClaims =
    postType === 'specific'
      ? postId
        ? claims.byPost[postId]
        : undefined
      : claims.anyPost;

  return (
    <div className="h-full">
      <Form {...form}>
        <Form.Field
          control={control}
          name="botId"
          render={({ field }) => (
            <Form.Item>
              <FacebookBotSelector
                botId={field.value}
                onSelect={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className={cn('flex flex-col gap-2 p-4', { blur: !botId })}>
          <Form.Field
            control={control}
            name="postType"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="flex items-center gap-1.5">
                  {t('type')}
                  <TriggerClaimNote claims={scopeClaims} />
                </Form.Label>
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
                  <Form.Message />
                </Form.Item>
              )}
            />
          ) : null}

          <Form.Field
            control={control}
            name="onlyFirstLevel"
            render={({ field }) => (
              <Form.Item className="flex items-center justify-between">
                <Form.Label>
                  {t(
                    'track-first-level-comments',
                    'Track first level comments only',
                  )}
                </Form.Label>
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
                <Form.Label>
                  {t(
                    'check-comment-text-keywords',
                    'Check comment text contains with keywords',
                  )}
                </Form.Label>
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
                  emptyDescription={t('comment-no-conditions-description', {
                    defaultValue:
                      'With no keywords this trigger answers every comment it sees.',
                  })}
                  onConditionChange={(_, values) => field.onChange(values)}
                />
              )}
            />
          ) : null}
        </div>
      </Form>
    </div>
  );
};
