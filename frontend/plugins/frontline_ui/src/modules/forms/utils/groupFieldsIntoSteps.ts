export interface IFormStepMeta {
  name?: string;
  description?: string;
  order: number;
}

/**
 * Places every saved field into an editor step. A field the editor does not
 * show is sent as removed on save, which deletes it and orphans its
 * submissions, so no field may be left out. Legacy forms have no steps and
 * fields may lack a page number; both fall back to a usable step.
 */
export const groupFieldsIntoSteps = <
  TField extends { pageNumber?: number | null },
>(
  steps: Record<string, IFormStepMeta> | null | undefined,
  fields: TField[],
): Record<string, IFormStepMeta & { fields: TField[] }> => {
  const pageOf = (field: TField) => field.pageNumber ?? 1;
  const savedSteps = Object.entries(steps ?? {}).sort(
    (a, b) => a[1].order - b[1].order,
  );

  if (!savedSteps.length) {
    const pages = [...new Set(fields.map(pageOf))].sort((a, b) => a - b);
    return Object.fromEntries(
      pages.map((page, index) => [
        String(index + 1),
        {
          name: `Step ${index + 1}`,
          description: '',
          order: index + 1,
          fields: fields.filter((field) => pageOf(field) === page),
        },
      ]),
    );
  }

  const keyByOrder = new Map<number, string>();
  for (const [key, step] of savedSteps) {
    if (!keyByOrder.has(step.order)) keyByOrder.set(step.order, key);
  }
  const [firstStepKey] = savedSteps[0];

  // Match fields by the saved orders, but number editor steps consecutively.
  const grouped = Object.fromEntries(
    savedSteps.map(([key, step], index) => [
      key,
      { ...step, order: index + 1, fields: [] as TField[] },
    ]),
  );
  for (const field of fields) {
    grouped[keyByOrder.get(pageOf(field)) ?? firstStepKey].fields.push(field);
  }
  return grouped;
};
