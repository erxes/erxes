export interface PayloadSchemaGeneratorProps {
  value?: TIncomingWebhookJSONPropertySchema[];
  onChange: (next: TIncomingWebhookJSONPropertySchema[]) => void;
}

export interface TIncomingWebhookJSONPropertyEditorProps {
  property: TIncomingWebhookJSONPropertySchema;
  depth?: number;
  onUpdate: (propertyId: string, field: string, value: unknown) => void;
  onRemove: (propertyId: string) => void;
  onAddChild: (parentId: string) => void;
  onToggleExpanded: (propertyId: string) => void;
}

export interface TIncomingWebhookJSONPropertySchema {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  isExpanded?: boolean;
  children?: TIncomingWebhookJSONPropertySchema[];
  arrayItemType?: 'string' | 'number' | 'boolean' | 'object';
  arrayItemSchema?: TIncomingWebhookJSONPropertySchema[];
}
