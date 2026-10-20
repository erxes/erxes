import type { CmsCustomFieldGroupListQuery } from '~/gql/graphql';
import { FieldDefinition } from '../../posts/CustomFieldInput';
import { ICustomField, ICustomFieldGroup } from '../types/customFieldTypes';

type CustomFieldGroupResult = NonNullable<
  NonNullable<
    NonNullable<CmsCustomFieldGroupListQuery['cmsCustomFieldGroupList']>['list']
  >[number]
>;

/**
 * Reads a group's `fields` JSON scalar as the fields this UI saved. Every entry
 * is kept: reordering writes the whole array back, so a dropped entry would be
 * deleted.
 */
export const toCustomFields = (fields: unknown): ICustomField[] =>
  Array.isArray(fields) ? (fields as ICustomField[]) : [];

export const toFieldDefinitions = (fields: unknown): FieldDefinition[] =>
  toCustomFields(fields);

export const toCustomFieldGroup = (
  group: CustomFieldGroupResult,
): ICustomFieldGroup => ({
  ...group,
  fields: toCustomFields(group.fields),
});
