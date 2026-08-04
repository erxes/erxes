import {
  GetExportData,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { buildFormSubmissionExportRow } from './buildFormSubmissionExportRow';

export async function getFormSubmissionExportData(
  data: GetExportData,
  { models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const match: Record<string, any> = {};

  if (filters?.formId) match.formId = filters.formId;
  if (filters?.customerId) match.customerId = filters.customerId;
  if (ids?.length) match.groupId = { $in: ids };
  if (cursor) {
    match.groupId = { ...(match.groupId || {}), $gt: cursor };
  }

  // Fetch form fields to build per-field columns (same fields used in headers)
  const formFields = filters?.formId
    ? await models.Fields.find({ contentTypeId: filters.formId })
        .sort({ order: 1 })
        .lean()
    : [];

  const pipeline: any[] = [
    { $match: match },
    {
      $group: {
        _id: '$groupId',
        customerId: { $first: '$customerId' },
        contentTypeId: { $first: '$contentTypeId' },
        submittedAt: { $first: '$submittedAt' },
        formId: { $first: '$formId' },
        submissions: {
          $push: {
            formFieldId: '$formFieldId',
            value: '$value',
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: limit },
  ];

  const results = await models.FormSubmissions.aggregate(pipeline);

  return results.map((row) =>
    buildFormSubmissionExportRow(row, formFields, selectedFields ?? []),
  );
}
