import { InfoCard, Form, Switch, Label, Input, Separator } from 'erxes-ui';
import { AnimatePresence, motion } from 'motion/react';

import { ContactType, TPipelineConfig } from '@/pipelines/types';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectContactType } from './contact-type/SelectContactType';
import { CustomerFields } from './CustomerFields';
import { CompanyFields } from './CompanyFields';
import { useEffect } from 'react';

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
      <InfoCard
        title="Select fields"
        description="Select the fields from the ticket to show in the form"
      >
        <InfoCard.Content>
          <Form.Field
            control={control}
            name="ticketBasicFields.isShowName"
            render={({ field }) => (
              <Form.Item className="flex items-center gap-2">
                <Form.Control>
                  <Switch
                    id="isShowTicketName"
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label variant="peer" htmlFor="isShowTicketName">
                  Name
                </Label>
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="ticketBasicFields.isShowDescription"
            render={({ field }) => (
              <Form.Item className="flex items-center gap-2">
                <Form.Control>
                  <Switch
                    id="isShowDescription"
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label variant="peer" htmlFor="isShowDescription">
                  Description
                </Label>
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="ticketBasicFields.isShowTags"
            render={({ field }) => (
              <Form.Item className="flex items-center gap-2">
                <Form.Control>
                  <Switch
                    id="isShowTags"
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label variant="peer" htmlFor="isShowTags">
                  Tags
                </Label>
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="ticketBasicFields.isShowAttachment"
            render={({ field }) => (
              <Form.Item className="flex items-center gap-2">
                <Form.Control>
                  <Switch
                    id="isShowAttachment"
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label variant="peer" htmlFor="isShowAttachment">
                  Attachment
                </Label>
              </Form.Item>
            )}
          />
        </InfoCard.Content>
      </InfoCard>
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
