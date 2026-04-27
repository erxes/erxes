import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, Input, Select, Toggle } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';
import {
  TIncomingWebhookJSONPropertyEditorProps,
  TIncomingWebhookJSONPropertySchema,
} from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';

export function IncomingWebhookJSONPropertyEditor({
  property,
  depth = 0,
  onUpdate,
  onRemove,
  onAddChild,
  onToggleExpanded,
}: TIncomingWebhookJSONPropertyEditorProps) {
  const hasIndent = depth > 0;
  const isExpandable =
    property.type === 'object' ||
    (property.type === 'array' && property.arrayItemType === 'object');
  const showArrayItemSelector = property.type === 'array';
  const canAddChild =
    property.type === 'object' ||
    (property.type === 'array' && property.arrayItemType === 'object');
  const showObjectChildren =
    property.type === 'object' &&
    Boolean(property.isExpanded && property.children);
  const showArrayObjectChildren =
    property.type === 'array' &&
    property.arrayItemType === 'object' &&
    Boolean(property.isExpanded);

  return (
    <div className={`space-y-2${hasIndent ? ' ml-4' : ''}`}>
      <div className="flex flex-row items-end gap-2">
        <div className="flex-1 flex items-end gap-2">
          <div className="flex items-center justify-center">
            {isExpandable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpanded(property.id)}
              >
                {property.isExpanded ? (
                  <IconChevronDown />
                ) : (
                  <IconChevronRight />
                )}
              </Button>
            )}
            {hasIndent && <div className="w-px h-6 bg-gray-300 ml-2" />}
          </div>

          <div>
            <Input
              placeholder="Property name"
              value={property.name}
              onChange={(e) => onUpdate(property.id, 'name', e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 flex gap-2 items-end">
          <div>
            <Select
              value={property.type}
              onValueChange={(value) => onUpdate(property.id, 'type', value)}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="string">String</Select.Item>
                <Select.Item value="number">Number</Select.Item>
                <Select.Item value="boolean">Boolean</Select.Item>
                <Select.Item value="object">Object</Select.Item>
                <Select.Item value="array">Array</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {showArrayItemSelector && (
            <div>
              <Select
                value={property.arrayItemType || 'string'}
                onValueChange={(value) =>
                  onUpdate(property.id, 'arrayItemType', value)
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="string">String[]</Select.Item>
                  <Select.Item value="number">Number[]</Select.Item>
                  <Select.Item value="boolean">Boolean[]</Select.Item>
                  <Select.Item value="object">Object[]</Select.Item>
                </Select.Content>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-center px-2">
            <Toggle
              pressed={property.required}
              onPressedChange={(pressed) =>
                onUpdate(property.id, 'required', pressed)
              }
            >
              {property.required ? 'Required' : 'Optional'}
            </Toggle>
          </div>
        </div>

        <div className="flex gap-1">
          {canAddChild && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newProperty: TIncomingWebhookJSONPropertySchema = {
                  id: generateAutomationElementId(),
                  name: '',
                  type: 'string',
                  required: true,
                  description: '',
                  isExpanded: true,
                };
                if (property.type === 'object') {
                  onAddChild(property.id);
                } else if (
                  property.type === 'array' &&
                  property.arrayItemType === 'object'
                ) {
                  const next = [
                    ...(property.arrayItemSchema || []),
                    newProperty,
                  ];
                  onUpdate(property.id, 'arrayItemSchema', next);
                }
              }}
              title="Add child property"
            >
              <IconPlus />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(property.id)}
          >
            <IconX />
          </Button>
        </div>
      </div>

      {showObjectChildren && (
        <div className="space-y-2 border-l pl-4 ml-2">
          {property.children?.map((child) => (
            <IncomingWebhookJSONPropertyEditor
              key={child.id}
              property={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddChild={onAddChild}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}

      {showArrayObjectChildren && (
        <div className="space-y-2 border-l pl-4 ml-2">
          <div className="text-xs font-medium">Array Item Schema:</div>
          {property.arrayItemSchema?.map((child) => (
            <IncomingWebhookJSONPropertyEditor
              key={child.id}
              property={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddChild={onAddChild}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
          <div className="text-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newProperty: TIncomingWebhookJSONPropertySchema = {
                  id: generateAutomationElementId(),
                  name: '',
                  type: 'string',
                  required: true,
                  description: '',
                  isExpanded: true,
                };
                const next = [...(property.arrayItemSchema || []), newProperty];
                onUpdate(property.id, 'arrayItemSchema', next);
              }}
            >
              <IconPlus className="mr-1" />
              Add Array Item Property
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

IncomingWebhookJSONPropertyEditor.displayName =
  'IncomingWebhookJSONPropertyEditor';
