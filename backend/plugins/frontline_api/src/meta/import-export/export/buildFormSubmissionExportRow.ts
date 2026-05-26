const formatValue = (v: any) => (v == null ? '' : String(v));

export const buildFormSubmissionExportRow = (
  row: any,
  formFields: any[],
  selectedFields?: string[],
): Record<string, any> => {
  // Map formFieldId -> value from the aggregated submissions array
  const submissionMap = new Map<string, any>();
  for (const s of row.submissions || []) {
    submissionMap.set(String(s.formFieldId), s.value);
  }

  const staticFields: Record<string, any> = {
    _id: formatValue(row._id),
    customerId: formatValue(row.customerId),
    formId: formatValue(row.formId),
    contentTypeId: formatValue(row.contentTypeId),
    submittedAt: row.submittedAt ? new Date(row.submittedAt).toISOString() : '',
  };

  // One column per form field, keyed as field_<fieldId>
  const dynamicFields: Record<string, any> = {};
  for (const field of formFields) {
    const key = `field_${field._id}`;
    dynamicFields[key] = formatValue(submissionMap.get(String(field._id)));
  }

  if (selectedFields?.length) {
    const result: Record<string, any> = {};
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
