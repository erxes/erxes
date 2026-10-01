export type PropertySystemFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multiSelect'
  | 'relation'
  | 'file'
  | 'phone';

export interface IPropertySystemField {
  code: string;
  name: string;
  type: PropertySystemFieldType;
}

// Featured fields: created at runtime by a plugin feature, stored in
// propertiesData like custom fields, but only their owner may change them.
export type FeaturedFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multiSelect';

export interface IFeaturedFieldOwner {
  plugin: string;
  module: string;
  // Instance-scoped owner (e.g. one score campaign); absent for fields a
  // plugin declares once in its meta.
  refId?: string;
}

export interface IFeaturedFieldDefinition {
  key: string;
  name: string;
  type: FeaturedFieldType;
  options?: { label: string; value: string }[];
  index?: { unique?: boolean };
}

export interface IFeaturedFieldGroup {
  key: string;
  name: string;
}

// Declared once in a plugin's meta, on any content type (e.g. core:customer).
export interface IPropertyFeaturedFields {
  contentType: string;
  module: string;
  group: IFeaturedFieldGroup;
  fields: IFeaturedFieldDefinition[];
}

export interface IPropertyType {
  type: string;
  description: string;
  systemFields?: IPropertySystemField[];
}

export interface IPropertyMeta {
  types: IPropertyType[];
  featuredFields?: IPropertyFeaturedFields[];
}
