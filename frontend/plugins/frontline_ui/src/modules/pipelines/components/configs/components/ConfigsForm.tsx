import { Form, Input, Separator } from 'erxes-ui';
import { AnimatePresence, motion } from 'motion/react';

import { ContactType, TPipelineConfig } from '@/pipelines/types';
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectContactType } from './contact-type/SelectContactType';
import { CustomerFields } from './CustomerFields';
import { CompanyFields } from './CompanyFields';
import { useEffect } from 'react';
import { TicketBasicFields } from './TicketBasicFields';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
  defaultValues?: TPipelineConfig;
};

export const ConfigsForm = ({ form, defaultValues }: Props) => {
  const { control } = form;
  const contactType = useWatch({
    control: control,
    name: 'contactType',
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fieldsConfig',
  });

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
          name="contactType"
          render={({ field }) => (
            <Form.Item>
              <SelectContactType.FormItem
                value={field.value as ContactType}
                onValueChange={field.onChange}
                form={form}
              />
            </Form.Item>
          )}
        />
      </div>
      <Separator />
      <TicketBasicFields form={form} />
      <AnimatePresence mode="popLayout">
        {contactType && (
          <motion.div
            key={contactType}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {contactType === 'customer' ? (
              <CustomerFields form={form} />
            ) : (
              <CompanyFields form={form} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
