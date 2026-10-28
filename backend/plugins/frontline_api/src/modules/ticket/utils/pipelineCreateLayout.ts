import { validatePipelinePropertyIds } from '@/ticket/utils/pipelineProperties';

export const LAYOUT_PROPERTY_PREFIX = 'property:';
const MAX_ITEMS_PER_ROW = 4;

// System fields the create form can place; name, channel, pipeline, status and
// description stay fixed around the laid-out rows.
export const TICKET_CREATE_LAYOUT_SYSTEM_CODES = [
  'priority',
  'assigneeId',
  'entityIds',
  'startDate',
  'targetDate',
  'tagIds',
];

/**
 * Cleans a pipeline's create form layout. Null clears it, so the form falls
 * back to its default; properties deleted since are dropped, unknown system
 * fields are refused.
 */
export const validatePipelineCreateLayout = async (
  subdomain: string,
  layout?: string[][] | null,
): Promise<string[][] | null> => {
  if (!layout) {
    return null;
  }

  const placeable = new Set(TICKET_CREATE_LAYOUT_SYSTEM_CODES);
  const propertyIds: string[] = [];

  for (const id of layout.flat()) {
    if (id.startsWith(LAYOUT_PROPERTY_PREFIX)) {
      propertyIds.push(id.slice(LAYOUT_PROPERTY_PREFIX.length));
    } else if (!placeable.has(id)) {
      throw new Error(`"${id}" cannot be placed on the create form`);
    }
  }

  const validPropertyIds = new Set(
    await validatePipelinePropertyIds(subdomain, propertyIds),
  );
  const seen = new Set<string>();

  return layout
    .map((row) =>
      row.filter((id) => {
        const keep =
          !seen.has(id) &&
          (!id.startsWith(LAYOUT_PROPERTY_PREFIX) ||
            validPropertyIds.has(id.slice(LAYOUT_PROPERTY_PREFIX.length)));

        seen.add(id);

        return keep;
      }),
    )
    .filter((row) => row.length)
    .map((row) => {
      if (row.length > MAX_ITEMS_PER_ROW) {
        throw new Error(
          `A create form row holds at most ${MAX_ITEMS_PER_ROW} fields`,
        );
      }

      return row;
    });
};
