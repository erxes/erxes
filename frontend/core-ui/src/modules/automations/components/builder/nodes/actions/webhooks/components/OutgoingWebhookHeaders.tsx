import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Label, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const OutgoingWebhookHeaders = () => {
  const { control } = useFormContext<TOutgoingWebhookForm>();

  return (
    <>
      <div>
        <Form.Field
          control={control}
          name="headers"
          render={({ field }) => {
            const { value: headers = [], onChange } = field;

            return (
              <>
                <div className="flex items-center justify-between mb-6">
                  <Label className="text-sm font-medium">Send Headers</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange([
                        ...headers,
                        { key: '', value: '', type: 'fixed' },
                      ])
                    }
                  >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Header
                  </Button>
                </div>

                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => {
                        const newHeaders = [...headers];
                        newHeaders[index].key = e.target.value;
                        onChange(newHeaders);
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value or expression"
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = [...headers];
                        newHeaders[index].value = e.target.value;
                        onChange(newHeaders);
                      }}
                      className="flex-1 font-mono"
                    />
                    <Select
                      value={header.type}
                      onValueChange={(value: 'fixed' | 'expression') => {
                        const newHeaders = [...headers];
                        newHeaders[index].type = value;
                        onChange(newHeaders);
                      }}
                    >
                      <Select.Trigger className="w-32">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="fixed">Fixed</Select.Item>
                        <Select.Item value="expression">Expression</Select.Item>
                      </Select.Content>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onChange(headers.filter((_, i) => i !== index))
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
    </>
  );
};
