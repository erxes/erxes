import { TPipelineConfig } from '@/pipelines/types';
import { Form, InfoCard, Label, Switch } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';

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
        <Form.Field
          control={control}
          name="customer.isShowFirstName"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id="isShowFirstName"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label variant="peer" htmlFor="isShowFirstName">
                First Name
              </Label>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="customer.isShowLastName"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id="isShowLastName"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label variant="peer" htmlFor="isShowLastName">
                Last Name
              </Label>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="customer.isShowEmail"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id="isShowEmail"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label variant="peer" htmlFor="isShowEmail">
                Email
              </Label>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="customer.isShowPhoneNumber"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id="isShowPhoneNumber"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label variant="peer" htmlFor="isShowPhoneNumber">
                Phone Number
              </Label>
            </Form.Item>
          )}
        />
      </InfoCard.Content>
    </InfoCard>
  );
};
