export const generateUniqueSlug = async (
  model: any,
  cpId: string,
  field: string,
  baseSlug: string,
  count: number = 1
): Promise<string> => {
  const potentialSlug = count === 1 ? baseSlug : `${baseSlug}_${count}`;

  // Check if slug already exists
  const existing = await model.findOne({ [field]: potentialSlug, clientPortalId: cpId });

  if (!existing) {
    return potentialSlug;
  }

  // If slug exists, try with next increment number
  return generateUniqueSlug(model, cpId, field, baseSlug, count + 1);
};

/**
 * Generate unique slug excluding a specific document (for updates)
 */
export const generateUniqueSlugWithExclusion = async (
  model: any,
  field: string,
  baseSlug: string,
  excludeId: string,
  count: number = 1
): Promise<string> => {
  const potentialSlug = count === 1 ? baseSlug : `${baseSlug}-${count}`;

  // Check if slug already exists excluding current document
  const existingTag = await model.findOne({
    [field]: potentialSlug,
    _id: { $ne: excludeId },
  });

  if (!existingTag) {
    return potentialSlug;
  }

  // If slug exists, try with next increment number
  return generateUniqueSlugWithExclusion(
    model,
    field,
    baseSlug,
    excludeId,
    count + 1
  );
};
