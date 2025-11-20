import { z } from 'zod';
import { useAtomValue } from 'jotai';
import { useTicketForm } from '../hooks/useTicketForm';
import {
  Button,
  Form,
  InfoCard,
  Input,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import { Path } from 'react-hook-form';
import { TicketFormFields, TicketFormPlaceholders } from '../types';
import { EXCLUDED_TICKET_FORM_FIELDS } from '../../constants';
import { ticketConfigAtom } from '../../states';
import { useCreateWidgetTicket } from '../hooks/useCreateWidgetTicket';
import { getLocalStorageItem } from '@libs/utils';
import { useCreateRelation } from 'ui-modules';

const TICKET_DETAILS_FIELDS = ['name', 'description', 'attachments', 'tag'];
const CUSTOMER_FIELDS = ['firstName', 'lastName', 'phoneNumber', 'email'];
const COMPANY_FIELDS = [
  'companyName',
  'address',
  'registrationNumber',
  'companyPhoneNumber',
  'companyEmail',
];

export const TicketForm = ({
  setPage,
}: {
  setPage: (page: 'submissions' | 'submit') => void;
}) => {
  const cachedCustomerId = getLocalStorageItem('customerId');
  const { form, ticketSchema } = useTicketForm();
  const {
    createTicket,
    saveTicketCustomers,
    loading,
    saveTicketCustomersLoading,
  } = useCreateWidgetTicket();
  const { createRelation } = useCreateRelation();
  const { control, handleSubmit, reset } = form;
  const ticketConfig = useAtomValue(ticketConfigAtom);

  const excludedFields = EXCLUDED_TICKET_FORM_FIELDS;
  const contactType = ticketConfig?.contactType;

  const handleCancel = () => {
    form.reset();
    setPage('submissions');
  };

  const onSubmit = (data: z.infer<typeof ticketSchema>) => {
    const formData = data as Record<string, unknown>;

    createTicket({
      variables: {
        name: (formData?.name as string) ?? '',
        description: (formData?.description as string) ?? '',
        attachments: (formData?.attachments as any[]) ?? [],
        statusId: ticketConfig?.selectedStatusId as string,
        type: ticketConfig?.contactType as string,
        customerIds: [],
      },
      onCompleted: (dataOnCompleted: {
        widgetTicketCreated: { _id: string };
      }) => {
        if (contactType === 'customer') {
          saveTicketCustomers({
            variables: {
              customerId: cachedCustomerId,
              firstName: (formData?.firstName as string) ?? '',
              lastName: (formData?.lastName as string) ?? '',
              emails: [(formData?.email as string) ?? ''],
              phones: [(formData?.phoneNumber as string) ?? ''],
            },
            onCompleted: () => {
              createRelation({
                entities: [
                  {
                    contentType: 'core:customer',
                    contentId: cachedCustomerId,
                  },
                  {
                    contentType: 'frontline:ticket',
                    contentId: dataOnCompleted.widgetTicketCreated._id,
                  },
                ],
              });
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Ticket created successfully',
              });
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
        } else if (contactType === 'company') {
          saveTicketCustomers({
            variables: {
              customerId: cachedCustomerId,
              firstName: (formData?.companyName as string) ?? '',
              emails: [(formData?.companyEmail as string) ?? ''],
              phones: [(formData?.companyPhoneNumber as string) ?? ''],
            },
            onCompleted: () => {
              createRelation({
                entities: [
                  {
                    contentType: 'core:company',
                    contentId: cachedCustomerId,
                  },
                  {
                    contentType: 'frontline:ticket',
                    contentId: dataOnCompleted.widgetTicketCreated._id,
                  },
                ],
              });
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Ticket created successfully',
              });
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
        } else {
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Ticket created successfully',
          });
          reset();
          setPage('submissions');
        }
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

  const ticketDetailsFields = allFields.filter(([key]) =>
    TICKET_DETAILS_FIELDS.includes(key),
  );

  const customerFields = allFields.filter(
    ([key]) => CUSTOMER_FIELDS.includes(key) && contactType === 'customer',
  );

  const companyFields = allFields.filter(
    ([key]) => COMPANY_FIELDS.includes(key) && contactType === 'company',
  );

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
                {TicketFormFields[key as keyof typeof TicketFormFields]}
              </Form.Label>
              <Form.Control>
                <Textarea
                  {...field}
                  placeholder={
                    TicketFormPlaceholders[
                      key as keyof typeof TicketFormPlaceholders
                    ]
                  }
                  className="min-h-[100px] resize-none font-sans"
                />
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />
      );
    }

    if (key === 'tag' || key === 'attachments') {
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
                  {TicketFormFields[key as keyof typeof TicketFormFields]}
                </Form.Label>
                <Form.Control>
                  <Input
                    value={displayValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(
                        value ? value.split(',').map((v) => v.trim()) : [],
                      );
                    }}
                    placeholder={
                      TicketFormPlaceholders[
                        key as keyof typeof TicketFormPlaceholders
                      ]
                    }
                    className="flex h-8 w-full rounded-sm bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] placeholder:text-accent-foreground/70 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 focus-visible:shadow-focus font-sans"
                  />
                </Form.Control>
                <Form.Message className="text-destructive" />
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
              {TicketFormFields[key as keyof typeof TicketFormFields]}
            </Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder={
                  TicketFormPlaceholders[
                    key as keyof typeof TicketFormPlaceholders
                  ]
                }
                className="flex h-8 w-full rounded-sm bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] placeholder:text-accent-foreground/70 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 focus-visible:shadow-focus font-sans"
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
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
                title="Ticket details"
                description="Please fill in the details of the ticket"
                className="shadow-2xs bg-foreground/5 font-mono uppercase text-accent-foreground [&_h3]:px-3 pt-0 p-1 space-y-1 rounded-xl"
              >
                <InfoCard.Content className="flex flex-col gap-3 bg-background rounded-lg p-3 shadow-sm flex-auto">
                  {ticketDetailsFields.map(renderField)}
                </InfoCard.Content>
              </InfoCard>
            )}

            {/* Customer Details */}
            {customerFields.length > 0 && (
              <InfoCard
                title="Customer details"
                description="Please fill in the details of the customer"
                className="shadow-2xs bg-foreground/5 font-mono uppercase text-accent-foreground [&_h3]:px-3 pt-0 p-1 space-y-1 rounded-xl"
              >
                <InfoCard.Content className="flex flex-col gap-3 bg-background rounded-lg p-3 shadow-sm flex-auto">
                  {customerFields.map(renderField)}
                </InfoCard.Content>
              </InfoCard>
            )}

            {/* Company Details */}
            {companyFields.length > 0 && (
              <InfoCard
                title="Company details"
                description="Please fill in the details of the company"
                className="shadow-2xs bg-foreground/5 font-mono uppercase text-accent-foreground [&_h3]:px-3 pt-0 p-1 space-y-1 rounded-xl"
              >
                <InfoCard.Content className="flex flex-col gap-3 bg-background rounded-lg p-3 shadow-sm flex-auto">
                  {companyFields.map(renderField)}
                </InfoCard.Content>
              </InfoCard>
            )}
          </div>

          <div className="flex justify-end shrink-0 px-5 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-8 shadow-2xs flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || saveTicketCustomersLoading}
              className="bg-primary h-8 shadow-2xs flex-1"
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
