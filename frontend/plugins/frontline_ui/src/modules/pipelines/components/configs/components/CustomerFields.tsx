import { TPipelineConfig } from '@/pipelines/types';
import { Form, InfoCard, Label, Switch } from 'erxes-ui';
import { UseFormReturn, Path } from 'react-hook-form';
import { TICKET_FORM_FIELDS } from '../constant';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

export const CustomerFields = ({ form }: Props) => {
  const { control } = form;
  return (
    <InfoCard
      key="customer"
      title="Select Customer Fields"
      description="Select the fields from the customer to show in the pipeline form"
    >
      <InfoCard.Content>
        {TICKET_FORM_FIELDS.filter((f) => f.path === 'customer').map(
          (customerField) => {
            return (
              <Form.Field
                key={`customer.${customerField.key}`}
                control={control}
                name={`customer.${customerField.key}` as Path<TPipelineConfig>}
                render={({ field }) => (
                  <Form.Item className="flex items-center gap-2">
                    <Form.Control>
                      <Switch
                        id={`customer.${customerField.key}`}
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Label variant="peer" htmlFor={`customer.${customerField.key}`}>
                      {customerField.label}
                    </Label>
                  </Form.Item>
                )}
              />
            );
          },
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
