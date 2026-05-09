import { BuilderNode, ElementKind } from '../types';

export type PropSchemaField =
  | {
      key: string;
      label: string;
      type: 'string' | 'text' | 'url' | 'image' | 'color';
      default?: string;
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: 'number';
      default?: number;
      min?: number;
      max?: number;
    }
  | {
      key: string;
      label: string;
      type: 'boolean';
      default?: boolean;
    }
  | {
      key: string;
      label: string;
      type: 'select';
      options: { label: string; value: string }[];
      default?: string;
    };

export type ElementDef = {
  type: string;
  kind: ElementKind;
  label: string;
  icon: React.ElementType;
  description?: string;
  acceptsChildren?: boolean;
  hidden?: boolean;
  defaultChildren?: () => BuilderNode[];
  propsSchema: PropSchemaField[];
  Component: React.FC<{
    node: BuilderNode;
    children?: React.ReactNode;
  }>;
};

export const defaultPropsFor = (
  schema: PropSchemaField[],
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const field of schema) {
    if (field.default !== undefined) out[field.key] = field.default;
  }
  return out;
};
