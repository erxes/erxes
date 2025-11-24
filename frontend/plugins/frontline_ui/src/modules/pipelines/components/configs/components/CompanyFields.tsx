import { TPipelineConfig } from '@/pipelines/types';
import { Form, InfoCard, Label, Switch } from 'erxes-ui';
import { Path, UseFormReturn } from 'react-hook-form';
import { TICKET_FORM_FIELDS } from '../constant';

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
        {TICKET_FORM_FIELDS.filter((f) => f.path === 'company').map(
          (companyField) => (
            <Form.Field
              key={`company.${companyField.key}`}
              control={control}
              name={`company.${companyField.key}` as Path<TPipelineConfig>}
              render={({ field }) => (
                <Form.Item className="flex items-center gap-2">
                  <Form.Control>
                    <Switch
                      id={`company.${companyField.key}`}
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Label variant="peer" htmlFor={`company.${companyField.key}`}>
                    {companyField.label}
                  </Label>
                </Form.Item>
              )}
            />
          ),
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
