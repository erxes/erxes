import { TPipelineConfig } from '@/pipelines/types';
import { Form, InfoCard, Label, Switch } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

export const CompanyFields = ({ form }: Props) => {
  const { control } = form;
  return (
    <InfoCard
      key="company"
      title="Select Company Fields"
      description="Select the fields from the company to show in the pipeline form"
    >
      <InfoCard.Content>
        <Form.Field
          control={control}
          name="company.isShowName"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id="isShowName"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label variant="peer" htmlFor="isShowName">
                Name
              </Label>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="company.isShowEmail"
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
          name="company.isShowPhoneNumber"
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
        <Form.Field
          control={control}
          name="company.isShowRegistrationNumber"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id="isShowRegistrationNumber"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label variant="peer" htmlFor="isShowRegistrationNumber">
                Registration Number
              </Label>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="company.isShowAddress"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id="isShowAddress"
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label variant="peer" htmlFor="isShowAddress">
                Address
              </Label>
            </Form.Item>
          )}
        />
      </InfoCard.Content>
    </InfoCard>
  );
};
