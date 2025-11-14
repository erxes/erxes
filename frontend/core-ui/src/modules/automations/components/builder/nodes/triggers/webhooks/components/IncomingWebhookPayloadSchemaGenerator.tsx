import { IncomingWebhookJSONPropertyEditor } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookJSONPropertyEditor';
import {
  PayloadSchemaGeneratorProps,
  TIncomingWebhookJSONPropertySchema,
} from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';
import {
  addChildProperty,
  generateSchemaPreview,
  removePropertyFromList,
  toggleExpandedInList,
  updatePropertyInList,
} from '@/automations/components/builder/nodes/triggers/webhooks/utils/incomingWebhookJsonBuilder';
import { IconPlus, IconShield } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';

export const IncomingWebhookPayloadSchemaGenerator = ({
  value,
  onChange,
}: PayloadSchemaGeneratorProps) => {
  const properties = (value || []) as TIncomingWebhookJSONPropertySchema[];
  const previewJson = JSON.stringify(
    generateSchemaPreview(properties),
    null,
    2,
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Payload Schema Validation</h3>
        <p className="text-sm">Define required properties and data types.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Required Properties</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange([
                  ...properties,
                  {
                    id: generateAutomationElementId(),
                    name: '',
                    type: 'string',
                    required: true,
                    description: '',
                    isExpanded: true,
                  } as TIncomingWebhookJSONPropertySchema,
                ])
              }
            >
              <IconPlus className="mr-1" />
              Add Root Property
            </Button>
          </div>

          <div className="space-y-4">
            {properties.map((property) => (
              <IncomingWebhookJSONPropertyEditor
                key={property.id}
                property={property}
                onUpdate={(id, field, v) =>
                  onChange(updatePropertyInList(properties, id, field, v))
                }
                onRemove={(id) =>
                  onChange(removePropertyFromList(properties, id))
                }
                onAddChild={(parentId) =>
                  onChange(addChildProperty(properties, parentId))
                }
                onToggleExpanded={(id) =>
                  onChange(toggleExpandedInList(properties, id))
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 p-4 border rounded-lg md:sticky md:top-4 h-fit">
          <div className="flex items-start gap-2">
            <IconShield className="h-4 w-4 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Expected Payload Structure</p>
              <p className="text-xs">Updates in real-time as you edit.</p>
            </div>
          </div>
          <div className="p-3 rounded text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto border bg-white">
            <pre>{previewJson}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
