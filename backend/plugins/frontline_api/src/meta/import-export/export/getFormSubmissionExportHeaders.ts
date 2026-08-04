import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

const STATIC_HEADERS: ImportHeaderDefinition[] = [
  { label: 'Submission ID', key: '_id', isDefault: true },
  { label: 'Customer ID', key: 'customerId', isDefault: true },
  { label: 'Form ID', key: 'formId' },
  { label: 'Content Type ID', key: 'contentTypeId' },
  { label: 'Submitted At', key: 'submittedAt', isDefault: true },
];

export async function getFormSubmissionExportHeaders(
  data: any,
  ctx: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> {
  const filters = data?.filters ?? data?.data?.filters;
  const { models } = ctx;

  if (!filters?.formId || !models) {
    return STATIC_HEADERS;
  }

  const formFields = await models.Fields.find({
    contentTypeId: filters.formId,
  })
    .sort({ order: 1 })
    .lean();

  const fieldHeaders: ImportHeaderDefinition[] = formFields.map((field) => ({
    label: (field as any).text || String((field as any)._id),
    key: `field_${(field as any)._id}`,
    isDefault: true,
  }));

  return [...STATIC_HEADERS, ...fieldHeaders];
}
