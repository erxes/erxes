import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { AUTOMATION_INCOMING_WEBHOOK_API_METHODS } from '@/automations/components/builder/nodes/triggers/webhooks/constants/incomingWebhook';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Label, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { PlaceholderInput } from 'ui-modules';

const DISABLED_WEBHOOK_URL_SUGGESTIONS = {
  attribute: true,
  emoji: true,
  date: true,
  option: true,
  call_user: true,
  call_tag: true,
  call_product: true,
  call_company: true,
  call_customer: true,
} as const;

export const OutgoingWebhookRequest = () => {
  const { control } = useFormContext<TOutgoingWebhookForm>();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-end  gap-2">
        <Form.Field
          control={control}
          name="method"
          render={({ field }) => (
            <Form.Item className="w-1/6">
              <Form.Label>Method</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {AUTOMATION_INCOMING_WEBHOOK_API_METHODS.map((method) => {
                    return (
                      <Select.Item key={method} value={method}>
                        {method}
                      </Select.Item>
                    );
                  })}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="url"
          render={({ field }) => (
            <Form.Item className="w-5/6">
              <Form.Label>URL</Form.Label>
              <PlaceholderInput
                {...field}
                disabled={DISABLED_WEBHOOK_URL_SUGGESTIONS}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <div className="space-y-4">
        <Form.Field
          control={control}
          name="queryParams"
          render={({ field }) => {
            const { value: queryParams = [], onChange } = field;
            return (
              <>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Query Parameters
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange([...queryParams, { name: '', value: '' }])
                    }
                  >
                    <IconPlus className="mr-2" />
                    Add Parameter
                  </Button>
                </div>
                {queryParams.map((param, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Parameter name"
                      value={param.name}
                      onChange={(e) => {
                        const newParams = [...queryParams];
                        newParams[index].name = e.target.value;
                        onChange(newParams);
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value or expression"
                      value={param.value}
                      onChange={(e) => {
                        const newParams = [...queryParams];
                        newParams[index].value = e.target.value;
                        onChange(newParams);
                      }}
                      className="flex-1 font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onChange(queryParams.filter((_, i) => i !== index))
                      }
                    >
                      <IconTrash />
                    </Button>
                  </div>
                ))}
                <Form.Message />
              </>
            );
          }}
        />
      </div>
    </div>
  );
};
