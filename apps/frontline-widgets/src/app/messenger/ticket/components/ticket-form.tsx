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
import { useAtom, useSetAtom } from 'jotai';
import { Path } from 'react-hook-form';
import { z } from 'zod';
import { EXCLUDED_TICKET_FORM_FIELDS } from '../../constants';
import {
  selectedTicketConfigAtom,
  ticketTabAtom,
  userTicketCreatedNumberAtom,
} from '../../states';
import { ITicketPropertiesFields } from '../../types/connection';
import { useCreateWidgetTicket } from '../hooks/useCreateWidgetTicket';
import { useTicketForm } from '../hooks/useTicketForm';
import { SelectTicketTag } from './tags/select-ticket-tag';
import { TicketPropertyField } from './ticket-property-field';

const TICKET_DETAILS_FIELDS = ['name', 'description', 'attachments', 'tags'];

// Turns the form values of the configured property fields into the
// { [fieldId]: value } payload the widget ticket mutation expects
const buildPropertiesData = (
  propertyFields: ITicketPropertiesFields[],
  values: Record<string, unknown>,
) =>
  propertyFields.reduce<Record<string, unknown>>((acc, propertyField) => {
    const value = values?.[propertyField.fieldId];

    if (value === undefined || value === null) {
      return acc;
    }

    if (Array.isArray(value)) {
      if (value.length) {
        acc[propertyField.fieldId] = value;
      }
      return acc;
    }

    if (value instanceof Date) {
      acc[propertyField.fieldId] = value.toISOString();
      return acc;
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return acc;
      }

      acc[propertyField.fieldId] =
        propertyField.type === 'number' ? Number(trimmedValue) : trimmedValue;
      return acc;
    }

    acc[propertyField.fieldId] = value;
    return acc;
  }, {});

export const TicketForm = () => {
  const setPage = useSetAtom(ticketTabAtom);
  const cachedCustomerId = getLocalStorageItem('customerId');
  const { form, ticketSchema } = useTicketForm();
  const { createTicket, loading, saveTicketCustomersLoading } =
    useCreateWidgetTicket();
  const { control, handleSubmit, reset } = form;
  const [ticketConfig, setTicketConfig] = useAtom(selectedTicketConfigAtom);
  const setUserTicketCreatedNumber = useSetAtom(userTicketCreatedNumberAtom);

  const excludedFields = EXCLUDED_TICKET_FORM_FIELDS;

  const propertyFields = [...(ticketConfig?.propertyFields ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const handleCancel = () => {
    form.reset();
    setPage('selection');
    setTicketConfig(null);
  };

  const onSubmit = (data: z.infer<typeof ticketSchema>) => {
    const formData = data as Record<string, unknown>;

    const propertiesData = buildPropertiesData(
      propertyFields,
      (formData?.propertiesData as Record<string, unknown>) ?? {},
    );

    createTicket({
      refetchQueries: ['WidgetTicketsByCustomer'],
      variables: {
        name: (formData?.name as string) ?? '',
        description: (formData?.description as string) ?? '',
        attachments: (formData?.attachments as any[]) ?? [],
        statusId: ticketConfig?.selectedStatusId as string,
        tagIds: (formData?.tags as string[]) ?? [],
        customerIds: [cachedCustomerId],
        propertiesData,
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
          className="flex flex-col gap-3 w-full h-full text-foreground"
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
            {/* Ticket Properties */}
            {propertyFields.length > 0 && (
              <InfoCard
                title="Additional information"
                description="Please fill in the additional information of the ticket"
              >
                <InfoCard.Content>
                  {propertyFields.map((propertyField) => (
                    <TicketPropertyField
                      key={propertyField.fieldId}
                      propertyField={propertyField}
                      control={control}
                    />
                  ))}
                </InfoCard.Content>
              </InfoCard>
            )}
            <div className="flex justify-end shrink-0 px-5 gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 shadow-xs"
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
          </div>
        </form>
      </Form>
    </div>
  );
};
