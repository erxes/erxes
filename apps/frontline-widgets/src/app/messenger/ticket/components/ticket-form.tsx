import { getLocalStorageItem } from '@libs/utils';
import {
  Button,
  Form,
  InfoCard,
  Input,
  Spinner,
  Textarea,
  toast,
  Upload,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { Path } from 'react-hook-form';
import { z } from 'zod';
import { EXCLUDED_TICKET_FORM_FIELDS } from '../../constants';
import { ticketConfigAtom, userTicketCreatedNumberAtom } from '../../states';
import { useCreateWidgetTicket } from '../hooks/useCreateWidgetTicket';
import { useTicketForm } from '../hooks/useTicketForm';
import { SelectTicketTag } from './tags/select-ticket-tag';

const TICKET_DETAILS_FIELDS = ['name', 'description', 'attachments', 'tags'];

export const TicketForm = ({
  setPage,
}: {
  setPage: (page: 'submissions' | 'submit') => void;
}) => {
  const cachedCustomerId = getLocalStorageItem('customerId');
  const { form, ticketSchema } = useTicketForm();
  const { createTicket, loading, saveTicketCustomersLoading } =
    useCreateWidgetTicket();
  const { control, handleSubmit, reset } = form;
  const ticketConfig = useAtomValue(ticketConfigAtom);
  const setUserTicketCreatedNumber = useSetAtom(userTicketCreatedNumberAtom);

  const excludedFields = EXCLUDED_TICKET_FORM_FIELDS;

  const handleCancel = () => {
    form.reset();
    setPage('submissions');
  };

  const onSubmit = (data: z.infer<typeof ticketSchema>) => {
    const formData = data as Record<string, unknown>;

    createTicket({
      refetchQueries: ['WidgetTicketsByCustomer'],
      variables: {
        name: (formData?.name as string) ?? '',
        description: (formData?.description as string) ?? '',
        attachments: (formData?.attachments as any[]) ?? [],
        statusId: ticketConfig?.selectedStatusId as string,
        tagIds: (formData?.tags as string[]) ?? [],
        customerIds: [cachedCustomerId],
      },
      onCompleted: (dataOnCompleted: {
        widgetTicketCreated: { _id: string; number: string };
      }) => {
        toast({
          title: 'Success',
          variant: 'success',
          description: `Ticket created successfully. Number: ${dataOnCompleted.widgetTicketCreated.number}`,
        });
        setUserTicketCreatedNumber(dataOnCompleted.widgetTicketCreated.number);
        reset();
        setPage('submissions');
      },
      onError: (error) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };

  const allFields = Object.entries(ticketSchema.shape).filter(
    ([key]) => !excludedFields.includes(key),
  );

  const ticketDetailsFields = allFields
    .filter(([key]) => TICKET_DETAILS_FIELDS.includes(key))
    .sort(([keyA], [keyB]) => {
      const fieldKeyA = keyA === 'attachments' ? 'attachment' : keyA;
      const fieldKeyB = keyB === 'attachments' ? 'attachment' : keyB;

      const orderA =
        (ticketConfig?.formFields as any)?.[fieldKeyA]?.order ?? 999;
      const orderB =
        (ticketConfig?.formFields as any)?.[fieldKeyB]?.order ?? 999;

      return orderA - orderB;
    });

  const renderField = ([key]: [string, unknown]) => {
    if (key === 'description') {
      return (
        <Form.Field
          key={key}
          name={key as Path<z.infer<typeof ticketSchema>>}
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {ticketConfig?.formFields.description?.label || 'Description'}
              </Form.Label>
              <Form.Control>
                <Textarea
                  {...field}
                  placeholder={
                    ticketConfig?.formFields.description?.placeholder ||
                    'Enter description'
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      );
    }
    if (key === 'tags') {
      return (
        <Form.Field
          key={key}
          name={key as Path<z.infer<typeof ticketSchema>>}
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {ticketConfig?.formFields.tags?.label || 'Tags'}
              </Form.Label>
              <Form.Control>
                <SelectTicketTag
                  placeholder={
                    ticketConfig?.formFields.tags?.placeholder || 'Select tags'
                  }
                  parentId={ticketConfig?.parentId}
                  value={field.value}
                  mode="multiple"
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      );
    }
    if (key === 'attachments') {
      return (
        <Form.Field
          key={key}
          name={key as Path<z.infer<typeof ticketSchema>>}
          control={control}
          render={({ field }) => {
            const fieldValue = field.value as unknown as string[] | undefined;
            const displayValue =
              Array.isArray(fieldValue) && fieldValue.length > 0
                ? fieldValue.join(', ')
                : '';
            return (
              <Form.Item>
                <Form.Label>
                  {ticketConfig?.formFields.attachment?.label || 'Attachments'}
                </Form.Label>
                <Form.Control>
                  <Upload.Root
                    value={displayValue}
                    onChange={(e) => {
                      const value = (e as any).target.value;
                      field.onChange(
                        value
                          ? value.split(',').map((v: string) => v.trim())
                          : [],
                      );
                    }}
                  >
                    <Upload.Preview />
                    <Upload.Button type="button">
                      {ticketConfig?.formFields.attachment?.placeholder ||
                        'Upload attachments'}
                    </Upload.Button>
                  </Upload.Root>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            );
          }}
        />
      );
    }

    return (
      <Form.Field
        key={key}
        name={key as Path<z.infer<typeof ticketSchema>>}
        control={control}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {ticketConfig?.formFields.name?.label || 'Name'}
            </Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder={
                  ticketConfig?.formFields.name?.placeholder || 'Enter name'
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  };

  return (
    <div className="w-full h-full">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 p-3 w-full h-full"
        >
          <div className="flex flex-col gap-3 p-3 flex-1 w-full h-full overflow-y-auto styled-scroll">
            {/* Ticket Details */}
            {ticketDetailsFields.length > 0 && (
              <InfoCard
                title="Main information"
                description="Please fill in the main information of the ticket"
              >
                <InfoCard.Content>
                  {ticketDetailsFields.map(renderField)}
                </InfoCard.Content>
              </InfoCard>
            )}
          </div>

          <div className="flex justify-end shrink-0 px-5 gap-3">
            <Button
              type="button"
              variant="outline"
              className="shadow-2xs flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || saveTicketCustomersLoading}
              className="bg-primary shadow-2xs flex-1"
            >
              {loading || saveTicketCustomersLoading ? (
                <Spinner size="sm" />
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
