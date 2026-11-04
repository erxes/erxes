export interface IFormStepMeta {
  name?: string;
  description?: string;
  order: number;
}

export const groupFieldsIntoSteps = <
  TField extends { pageNumber?: number | null },
>(
  steps: Record<string, IFormStepMeta> | null | undefined,
  fields: TField[],
): Record<string, IFormStepMeta & { fields: TField[] }> => {
  const savedSteps = Object.entries(steps ?? {}).sort(
    (a, b) => a[1].order - b[1].order,
  );

  if (!savedSteps.length) {
    const pages = [
      ...new Set(
        fields
          .map((field) => field.pageNumber)
          .filter((page): page is number => page != null),
      ),
    ].sort((a, b) => a - b);
    if (!pages.length && fields.length) pages.push(1);
    return Object.fromEntries(
      pages.map((page, index) => [
        String(index + 1),
        {
          name: `Step ${index + 1}`,
          description: '',
          order: index + 1,
          fields: fields.filter(
            (field) =>
              field.pageNumber === page ||
              (field.pageNumber == null && index === 0),
          ),
        },
      ]),
    );
  }

  const keyByOrder = new Map<number, string>();
  for (const [key, step] of savedSteps) {
    if (!keyByOrder.has(step.order)) keyByOrder.set(step.order, key);
  }
  const [firstStepKey] = savedSteps[0];

  const grouped = Object.fromEntries(
    savedSteps.map(([key, step], index) => [
      key,
      { ...step, order: index + 1, fields: [] as TField[] },
    ]),
  );
  for (const field of fields) {
    const stepKey =
      field.pageNumber == null
        ? firstStepKey
        : keyByOrder.get(field.pageNumber) ?? firstStepKey;
    grouped[stepKey].fields.push(field);
  }
  return grouped;
};
