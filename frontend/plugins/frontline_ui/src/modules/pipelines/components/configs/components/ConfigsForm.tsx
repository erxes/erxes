import { Combobox, Form, Input, PopoverScoped, Separator } from 'erxes-ui';

import { TPipelineConfig } from '@/pipelines/types';
import { TICKET_FORM_FIELDS } from '../constant';
import { compactList } from '@/shared/utils/cursorList';
import type { ITicketConfigDetail } from '../hooks/useGetTicketConfigDetail';
import { UseFormReturn } from 'react-hook-form';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { useState } from 'react';
import { TicketBasicFields } from './TicketBasicFields';
import { TicketPropertyFields } from './TicketPropertyFields';
import { SelectTags } from 'ui-modules';
import { useTranslation } from 'react-i18next';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

/** Normalizes a saved ticket configuration for its form fields. */
export const toPipelineConfigFormValues = (
  config: ITicketConfigDetail,
): TPipelineConfig => ({
  name: config.name,
  channelId: config.channelId,
  pipelineId: config.pipelineId,
  selectedStatusId: config.selectedStatusId,
  parentId: config.parentId ?? undefined,
  formFields: Object.fromEntries(
    TICKET_FORM_FIELDS.map(({ key }) => {
      const field = config.formFields?.[key];
      return [
        key,
        {
          isShow: field?.isShow ?? false,
          label: field?.label ?? undefined,
          order: field?.order ?? undefined,
          placeholder: field?.placeholder ?? undefined,
        },
      ];
    }),
  ),
  propertyFields: compactList(config.propertyFields).map((field) => ({
    fieldId: field.fieldId,
    groupId: field.groupId,
    label: field.label,
    placeholder: field.placeholder,
    groupOrder: field.groupOrder,
    order: field.order,
    isRequired: field.isRequired,
    type: field.type,
    options: compactList(field.options).map(({ label, value }) => ({
      label,
      value,
    })),
  })),
});

/** Renders the editable ticket configuration fields. */
export const ConfigsForm = ({ form }: Props) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const [open, setOpen] = useState(false);
  const { control } = form;

  const nameField = (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <Input
              {...field}
              className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
              placeholder={t('configuration-name', 'Configuration Name')}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
  const statusField = (
    <Form.Field
      control={control}
      name="selectedStatusId"
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <SelectStatusTicket.FormItem
              value={field.value as string}
              onValueChange={field.onChange}
              form={form}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
  const parentField = (
    <Form.Field
      control={control}
      name="parentId"
      render={({ field }) => {
        const tagPopover = (
          <PopoverScoped open={open} onOpenChange={setOpen} scope="configs">
            <Combobox.Trigger className="w-full h-7 shadow-xs">
              <SelectTags.Value
                placeholder={t('select-tag-group', 'Select tag group')}
              />
            </Combobox.Trigger>
            <Combobox.Content onClick={(e) => e.stopPropagation()}>
              <SelectTags.GroupsCommand />
            </Combobox.Content>
          </PopoverScoped>
        );

        return (
          <Form.Item>
            <Form.Control>
              <SelectTags.Provider
                tagType="frontline:ticket"
                mode="single"
                value={field.value as string}
                onValueChange={(tag) => {
                  field.onChange(tag);
                  setOpen(false);
                }}
              >
                {tagPopover}
              </SelectTags.Provider>
            </Form.Control>
          </Form.Item>
        );
      }}
    />
  );

  return (
    <>
      {nameField}

      <div className="flex gap-2 w-full flex-wrap">
        {statusField}
        {parentField}
      </div>
      <Separator />
      <TicketBasicFields form={form} />
      <Separator />
      <TicketPropertyFields form={form} />
    </>
  );
};
