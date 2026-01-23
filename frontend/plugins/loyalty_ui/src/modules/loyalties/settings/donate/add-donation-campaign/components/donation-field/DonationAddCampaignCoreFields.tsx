import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button, Form, Input } from 'erxes-ui';
import { DonationFormValues } from '../../../constants/donationFormSchema';
import { SelectVoucherCampaign } from '../../../components/selects/SelectVoucherCampaign';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface DonationAddCampaignCoreFieldsProps {
  form: UseFormReturn<DonationFormValues>;
}

export const DonationAddCampaignCoreFields: React.FC<
  DonationAddCampaignCoreFieldsProps
> = ({ form }) => {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conditions',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Title</Form.Label>
              <Form.Control>
                <Input placeholder="Enter donation title" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="conditions.0.maxScore"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Max Score</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder="Enter max score"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div className="flex gap-4 items-end w-full" key={field.id}>
              <div className="flex-1 min-w-0">
                <Form.Field
                  control={form.control}
                  name={`conditions.${index}.voucherCampaignId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Voucher Campaign</Form.Label>
                      <Form.Control>
                        <SelectVoucherCampaign
                          value={field.value || undefined}
                          onValueChange={(id) => field.onChange(id)}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
              <div className="w-full sm:w-60">
                <Form.Field
                  control={form.control}
                  name={`conditions.${index}.minScore`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Min Score</Form.Label>
                      <Form.Control>
                        <Input
                          type="number"
                          placeholder="Score"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
              <Button
                onClick={() => remove(index)}
                variant="secondary"
                size="icon"
                className="size-8 bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <IconTrash />
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={() =>
            append({ minScore: 0, voucherCampaignId: '', maxScore: 0 })
          }
          className="flex w-full mt-5!"
          variant="secondary"
        >
          <IconPlus />
          Add level
        </Button>
      </div>
    </div>
  );
};
