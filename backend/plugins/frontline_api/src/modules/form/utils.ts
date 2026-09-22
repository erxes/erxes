import { IModels } from '~/connectionResolvers';

export interface IConversationFormSubmissions {
  formId?: string;
  formTitle?: string;
  submissions: { label: string; value: unknown }[];
}

export const getConversationFormSubmissions = async (
  models: IModels,
  conversationId: string,
): Promise<IConversationFormSubmissions | null> => {
  const submissionDocs = await models.FormSubmissions.find({
    conversationId,
  }).lean();

  if (!submissionDocs.length) {
    return null;
  }

  const formId = submissionDocs.find((doc) => doc.formId)?.formId;
  const form = formId
    ? await models.Forms.findOne({ _id: formId }).lean()
    : null;

  const fields = formId
    ? await models.Fields.find({ contentTypeId: formId }).lean()
    : [];
  const labelById = new Map<string, string>(
    fields.map((field: any) => [
      String(field._id),
      field.text || field.label || '',
    ]),
  );

  const submissions = submissionDocs.map((doc: any) => ({
    label: labelById.get(String(doc.formFieldId)) || doc.formFieldId || '',
    value: doc.value,
  }));

  return {
    formId,
    formTitle: form?.title,
    submissions,
  };
};

type Field = {
  name: string;
  label?: string;
};
export function getSchemaLabels(fields: Field[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    if (!field?.name) return acc;

    acc[field.name] = field.label || field.name;
    return acc;
  }, {});
}

export const buildLabelList = (obj = {}): any[] => {
  const list: any[] = [];
  const fieldNames: string[] = Object.getOwnPropertyNames(obj);

  for (const name of fieldNames) {
    const field: any = obj[name];
    const label: string = field?.label ?? '';

    list.push({ name, label });
  }

  return list;
};

export const getSocialLinkKey = (type: string) => {
  return type.substring(type.indexOf('_') + 1);
};
