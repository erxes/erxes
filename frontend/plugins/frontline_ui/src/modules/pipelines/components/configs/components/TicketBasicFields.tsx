import { TPipelineConfig } from '@/pipelines/types';
import { Path, useFieldArray, UseFormReturn } from 'react-hook-form';
import { Form, InfoCard, Input, Label, Switch } from 'erxes-ui';
import { TICKET_FORM_FIELDS } from '../constant';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

export const TicketBasicFields = ({ form }: Props) => {
  const { control } = form;
  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'fieldsConfig',
  });
  return (
    <InfoCard
      title="Select Ticket Basic Fields"
      description="Select the fields from the ticket to show in the pipeline form"
    >
      <InfoCard.Content>
        {TICKET_FORM_FIELDS.filter((f) => f.path === 'ticketBasicFields').map(
          (basicField) => (
            <div key={`ticketBasicFields.${basicField.key}`}>
              <Form.Field
                control={control}
                name={
                  `ticketBasicFields.${basicField.key}` as Path<TPipelineConfig>
                }
                render={({ field }) => {
                  const handleCheckedChange = (checked: boolean) => {
                    field.onChange(checked);
                    if (checked) {
                      basicField.onAppend(append);
                    }
                  };
                  return (
                    <Form.Item className="flex items-center gap-2">
                      <Form.Control>
                        <Switch
                          id={`ticketBasicFields.${basicField.key}`}
                          checked={field.value as boolean}
                          onCheckedChange={handleCheckedChange}
                        />
                      </Form.Control>
                      <Label
                        variant="peer"
                        htmlFor={`ticketBasicFields.${basicField.key}`}
                      >
                        {basicField.label}
                      </Label>
                    </Form.Item>
                  );
                }}
              />
              {/* Under construction */}
              {/* {fields.find((f) => f.key === basicField.key) && (
                <Form.Field
                  control={control}
                  name={
                    `fieldsConfig.${
                      fields.find((f) => f.key === basicField.key)?.key
                    }` as Path<TPipelineConfig>
                  }
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Control>
                          <Input
                            {...field}
                            value={field.value as string | undefined}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        </Form.Control>
                      </Form.Item>
                    );
                  }}
                />
              )} */}
            </div>
          ),
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
