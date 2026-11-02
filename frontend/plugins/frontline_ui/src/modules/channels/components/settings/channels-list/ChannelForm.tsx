import { UseFormReturn } from 'react-hook-form';
import { TChannelForm } from '@/channels/types';
import { Form, IconPicker, Input, Textarea } from 'erxes-ui';
import { PanelFormRow, SelectMember } from 'ui-modules';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const ChannelFormItem = ({
  panel,
  label,
  children,
  className,
}: {
  panel: boolean;
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <Form.Item className={className}>
    {panel ? (
      <PanelFormRow label={<Form.Label>{label}</Form.Label>}>
        {children}
      </PanelFormRow>
    ) : (
      <>
        <Form.Label>{label}</Form.Label>
        {children}
      </>
    )}
  </Form.Item>
);

export const ChannelForm = ({
  form,
  includeMembers = true,
  panel = false,
}: {
  form: UseFormReturn<TChannelForm>;
  includeMembers?: boolean;
  panel?: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  return (
    <div className="flex flex-col gap-3">
      <div className={panel ? 'flex flex-col gap-3' : 'w-full flex gap-2'}>
        <Form.Field
          control={form.control}
          name="icon"
          render={({ field }) => (
            <ChannelFormItem panel={panel} label={t('icon', 'Icon')}>
              <Form.Description className="sr-only">
                {t('icon', 'Icon')}
              </Form.Description>
              <Form.Control>
                <IconPicker
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                  className="w-min"
                />
              </Form.Control>
              <Form.Message />
            </ChannelFormItem>
          )}
        />
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <ChannelFormItem
              panel={panel}
              label={t('name', 'Name')}
              className="flex-auto"
            >
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </ChannelFormItem>
          )}
        />
      </div>

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <ChannelFormItem
            panel={panel}
            label={t('description', 'Description')}
          >
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </ChannelFormItem>
        )}
      />
      {includeMembers && (
        <Form.Field
          control={form.control}
          name="memberIds"
          render={({ field }) => (
            <ChannelFormItem
              panel={panel}
              label={t('members-title', 'Members')}
            >
              <Form.Control>
                <SelectMember.FormItem
                  mode="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
              <Form.Message />
            </ChannelFormItem>
          )}
        />
      )}
    </div>
  );
};
