interface ISubmissionItem {
  formFieldId: string;
  value: unknown;
}

export interface ISubmissionRow {
  _id: string;
  customerId: string;
  contentTypeId: string;
  formId: string;
  submittedAt: Date | string | null | undefined;
  submissions?: ISubmissionItem[];
}

export interface IFormField {
  _id: string;
}

export type IExportRow = Record<string, string>;

const formatValue = (v: unknown): string => {
  if (v == null) return '';
  if (v instanceof Date) {
    return isFinite(v.getTime()) ? v.toISOString() : '';
  }
  if (typeof v === 'object' || Array.isArray(v)) {
    try {
      return JSON.stringify(v);
    } catch {
      return '[object]';
    }
  }
  return String(v);
};

export const buildFormSubmissionExportRow = (
  row: ISubmissionRow,
  formFields: IFormField[],
  selectedFields?: string[],
): IExportRow => {
  const submissionMap = new Map<string, unknown>();
  for (const s of row.submissions || []) {
    submissionMap.set(String(s.formFieldId), s.value);
  }

  const staticFields: IExportRow = {
    _id: formatValue(row._id),
    customerId: formatValue(row.customerId),
    formId: formatValue(row.formId),
    contentTypeId: formatValue(row.contentTypeId),
    submittedAt: formatValue(row.submittedAt ? new Date(row.submittedAt) : null),
  };

  // One column per form field, keyed as field_<fieldId>
  const dynamicFields: IExportRow = {};
  for (const field of formFields) {
    const key = `field_${field._id}`;
    dynamicFields[key] = formatValue(submissionMap.get(String(field._id)));
  }

  if (selectedFields?.length) {
    const result: IExportRow = {};
    for (const key of selectedFields) {
      if (key in staticFields) {
        result[key] = staticFields[key];
      } else if (key in dynamicFields) {
        result[key] = dynamicFields[key];
      } else {
        result[key] = '';
      }
    }
    return result;
  }

  return { ...staticFields, ...dynamicFields };
};
