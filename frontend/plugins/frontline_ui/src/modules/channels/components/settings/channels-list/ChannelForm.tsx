import { TChannelForm } from '@/channels/types';
import { Form, IconPicker, Input, Textarea } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';

export const ChannelForm = ({
  form,
  withMembers = true,
  disabled = false,
  autoFocus = false,
}: {
  form: UseFormReturn<TChannelForm>;
  withMembers?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  return (
    <div className="flex flex-col gap-4">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name', 'Name')}</Form.Label>
            <div className="flex items-center gap-2">
              <Form.Field
                control={form.control}
                name="icon"
                render={({ field: iconField }) => (
                  <IconPicker
                    key={iconField.value ?? 'none'}
                    value={iconField.value ?? undefined}
                    onValueChange={iconField.onChange}
                    disabled={disabled}
                    variant="outline"
                    aria-label={t('choose-icon', 'Choose icon')}
                    className="size-7 shrink-0 justify-center px-0"
                  />
                )}
              />
              <Form.Control>
                <Input
                  {...field}
                  disabled={disabled}
                  autoFocus={autoFocus}
                  autoComplete="off"
                  placeholder={t(
                    'channel-name-placeholder',
                    'e.g. Customer support',
                  )}
                />
              </Form.Control>
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('description', 'Description')}
              <span className="ml-1 font-normal text-muted-foreground">
                {t('optional', '(optional)')}
              </span>
            </Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                value={field.value ?? ''}
                disabled={disabled}
                rows={3}
                className="resize-none"
                placeholder={t(
                  'channel-description-placeholder',
                  'What conversations and tickets belong here?',
                )}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      {withMembers && (
        <Form.Field
          control={form.control}
          name="memberIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('members-title', 'Members')}</Form.Label>
              <SelectMember.FormItem
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
                placeholder={t('add-teammates', 'Add teammates')}
              />
              <Form.Description>
                {t(
                  'channel-members-hint',
                  'You join as the channel admin. You can add more people later.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
