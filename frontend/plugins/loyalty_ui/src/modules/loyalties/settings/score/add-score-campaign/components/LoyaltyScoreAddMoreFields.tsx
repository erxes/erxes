import { UseFormReturn } from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  Tabs,
  Popover,
  Command,
  Combobox,
  Switch,
} from 'erxes-ui';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { SelectFieldGroup } from './selects/SelectFieldGroup';
import { SelectField } from './selects/SelectField';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { SCORE_CAMPAIGN_ATTRIBUTES_QUERY } from '../../graphql/queries/scoreCampaignAttributesQuery';

const AttributionSelect = ({
  serviceName,
  onSelect,
}: {
  serviceName: string;
  onSelect: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const { data } = useQuery(SCORE_CAMPAIGN_ATTRIBUTES_QUERY, {
    variables: { serviceName },
    skip: !serviceName,
  });

  const attributes: { label: string; value: string; group?: string }[] =
    data?.scoreCampaignAttributes || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-primary text-sm font-normal"
        >
          Attribution ▾
        </Button>
      </Popover.Trigger>
      <Combobox.Content className="w-64">
        <Command>
          <Command.Input placeholder="Type to search" />
          <Command.List>
            <Command.Group heading="Attributions">
              {attributes.map((attr) => (
                <Command.Item
                  key={attr.value}
                  value={attr.value}
                  onSelect={() => {
                    onSelect(`{{ ${attr.value} }}`);
                    setOpen(false);
                  }}
                >
                  {attr.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const OWNER_TYPES = [
  { label: 'Customers', value: 'customer' },
  { label: 'Companies', value: 'company' },
  { label: 'Team Members', value: 'user' },
];

const FieldNameSection = ({
  form,
  fieldGroupId,
  ownerType,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  fieldGroupId: string;
  ownerType: string;
}) => {
  const fieldOrigin = form.watch('fieldOrigin') || 'new';

  const setFieldTab = (tab: 'new' | 'exists') => {
    form.setValue('fieldOrigin', tab, { shouldDirty: true });
    form.setValue('fieldName', '');
    form.setValue('fieldId', '');
  };

  return (
    <div className="flex flex-col gap-2">
      <Form.Label>Field Name</Form.Label>
      <div className="flex gap-2">
        <button
          type="button"
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            fieldOrigin === 'new'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
          onClick={() => setFieldTab('new')}
        >
          New
        </button>
        <button
          type="button"
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            fieldOrigin === 'exists'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
          onClick={() => setFieldTab('exists')}
        >
          Exists
        </button>
      </div>

      {fieldOrigin === 'new' ? (
        <Form.Field
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input {...field} placeholder="Enter field name" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      ) : (
        <Form.Field
          control={form.control}
          name="fieldId"
          render={({ field }) => (
            <Form.Item>
              <SelectField.FormItem
                value={field.value || ''}
                onValueChange={field.onChange}
                contentTypes={[`core:${ownerType}`]}
                groupId={fieldGroupId}
                placeholder="Select field"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};

export const LoyaltyScoreAddMoreFields = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const selectedService = form.watch('conditions.serviceName');
  const selectedOwnerType = form.watch('ownerType');
  const selectedFieldGroupId = form.watch('fieldGroupId');

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={selectedService === 'sales' ? 'default' : 'outline'}
          onClick={() =>
            form.setValue('conditions.serviceName', 'sales', {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          Sales pipeline
        </Button>

        <Button
          type="button"
          variant={selectedService === 'pos' ? 'default' : 'outline'}
          onClick={() =>
            form.setValue('conditions.serviceName', 'pos', {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          POS order
        </Button>
      </div>

      {selectedService && (
        <Tabs defaultValue="add" className="w-full">
          <Tabs.List>
            <Tabs.Trigger value="add">Add</Tabs.Trigger>
            <Tabs.Trigger value="subtract">Subtract</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="add" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="add.placeholder"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex items-center gap-2">
                      <Form.Label>Score Value</Form.Label>
                      <AttributionSelect
                        serviceName={selectedService}
                        onSelect={(val) =>
                          field.onChange((field.value || '') + val)
                        }
                      />
                    </div>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder="Type a placeholder for add score"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="add.currencyRatio"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Currency Ratio</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Type a currency ratio" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </Tabs.Content>

          <Tabs.Content value="subtract" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="subtract.placeholder"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex items-center gap-2">
                      <Form.Label>Score Value</Form.Label>
                      <AttributionSelect
                        serviceName={selectedService}
                        onSelect={(val) =>
                          field.onChange((field.value || '') + val)
                        }
                      />
                    </div>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder="Type a placeholder for subtract score"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="subtract.currencyRatio"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Currency Ratio</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Type a currency ratio" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </Tabs.Content>
        </Tabs>
      )}

      {selectedService && (
        <div className="flex flex-col gap-2">
          <Form.Label>Apply Score To</Form.Label>
          <div className="grid grid-cols-3 gap-4">
            {OWNER_TYPES.map(({ label, value }) => (
              <Button
                key={value}
                type="button"
                variant={selectedOwnerType === value ? 'default' : 'outline'}
                onClick={() =>
                  form.setValue('ownerType', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedService && (
        <Form.Field
          control={form.control}
          name="onlyClientPortal"
          render={({ field }) => (
            <Form.Item className="flex flex-row items-center gap-2">
              <Form.Control>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Form.Label className="mb-2">
                Only Client Portal (optional)
              </Form.Label>
            </Form.Item>
          )}
        />
      )}

      {selectedOwnerType && (
        <Form.Field
          control={form.control}
          name="fieldGroupId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Field Group</Form.Label>
              <SelectFieldGroup
                value={field.value || ''}
                onValueChange={field.onChange}
                contentTypes={[`core:${selectedOwnerType}`]}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      )}

      {selectedOwnerType && selectedFieldGroupId && (
        <FieldNameSection
          form={form}
          fieldGroupId={selectedFieldGroupId}
          ownerType={selectedOwnerType}
        />
      )}
    </div>
  );
};
