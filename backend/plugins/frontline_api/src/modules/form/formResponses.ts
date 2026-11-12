import { IModels } from '~/connectionResolvers';
import type { TFormAboutRecord } from '~/modules/form/formLink';

export type TFormResponseAnswer = {
  fieldId: string;
  label: string;
  type?: string;
  value: unknown;
};

export type TFormResponse = {
  _id: string;
  formId: string;
  formTitle?: string;
  customerId?: string;
  submittedAt?: Date;
  answers: TFormResponseAnswer[];
};

/**
 * Answers given about a record, one per submit (its rows share a groupId),
 * newest first. The answers stay on the submissions; nothing is copied to the
 * record.
 */
export const getFormResponsesAbout = async (
  models: IModels,
  aboutRecord: TFormAboutRecord,
): Promise<TFormResponse[]> => {
  const rows = await models.FormSubmissions.find({
    'aboutRecord.id': aboutRecord.id,
    'aboutRecord.type': aboutRecord.type,
  })
    .sort({ submittedAt: -1 })
    .lean();

  if (!rows.length) {
    return [];
  }

  const formIds = [...new Set(rows.map((row) => row.formId).filter(Boolean))];
  const fieldIds = [
    ...new Set(rows.map((row) => row.formFieldId).filter(Boolean)),
  ];
  const [forms, fields] = await Promise.all([
    models.Forms.find({ _id: { $in: formIds } }, { title: 1 }).lean(),
    models.Fields.find({ _id: { $in: fieldIds } }, { text: 1, type: 1, order: 1 }).lean(),
  ]);
  const formTitles = new Map(forms.map((form) => [form._id, form.title]));
  const fieldsById = new Map(fields.map((field) => [field._id, field]));
  const responses = new Map<string, TFormResponse>();

  for (const row of rows) {
    const groupId = row.groupId || row._id;
    const response = responses.get(groupId) || {
      _id: groupId,
      formId: row.formId || '',
      formTitle: formTitles.get(row.formId || ''),
      customerId: row.customerId,
      submittedAt: row.submittedAt,
      answers: [],
    };
    const field = fieldsById.get(row.formFieldId || '');

    response.answers.push({
      fieldId: row.formFieldId || '',
      label: field?.text || field?.type || '',
      type: field?.type,
      value: row.value,
    });
    responses.set(groupId, response);
  }

  for (const response of responses.values()) {
    response.answers.sort(
      (a, b) =>
        (fieldsById.get(a.fieldId)?.order ?? 0) -
        (fieldsById.get(b.fieldId)?.order ?? 0),
    );
  }

  return [...responses.values()];
};
