import {
  Combobox,
  Form,
  Input,
  Popover,
  PopoverScoped,
  Separator,
} from 'erxes-ui';

import { TPipelineConfig } from '@/pipelines/types';
import { UseFormReturn } from 'react-hook-form';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { useEffect, useState } from 'react';
import { TicketBasicFields } from './TicketBasicFields';
import { SelectTags } from 'ui-modules';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
  defaultValues?: TPipelineConfig;
};

export const ConfigsForm = ({ form, defaultValues }: Props) => {
  const [open, setOpen] = useState(false);
  const { control } = form;

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return (
    <>
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Control>
              <Input
                {...field}
                className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                placeholder="Configuration Name"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <div className="flex gap-2 w-full flex-wrap">
        <Form.Field
          control={control}
          name="selectedStatusId"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <SelectStatusTicket.FormItem
                  value={field.value as string}
                  onValueChange={field.onChange}
                  form={form as any}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="parentId"
          render={({ field }) => (
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
                  <PopoverScoped
                    open={open}
                    onOpenChange={setOpen}
                    scope="configs"
                  >
                    <Combobox.Trigger className="w-full h-7 shadow-xs">
                      <SelectTags.Value placeholder="Select tag group" />
                    </Combobox.Trigger>
                    <Combobox.Content onClick={(e) => e.stopPropagation()}>
                      <SelectTags.GroupsCommand />
                    </Combobox.Content>
                  </PopoverScoped>
                </SelectTags.Provider>
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
      <Separator />
      <TicketBasicFields form={form} />
    </>
  );
};
