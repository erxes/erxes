import { Collection, Db, Document } from 'mongodb';

import { WordPressImportPlan } from './types';

interface SlugDocument extends Document {
  _id: string;
  clientPortalId: string;
  slug: string;
}

interface PlannedSlugDocument {
  _id: string;
  slug: string;
}

export const allocateUniqueSlug = (
  baseSlug: string,
  reservedSlugs: Set<string>,
): string => {
  let count = 1;
  let candidate = baseSlug;

  while (reservedSlugs.has(candidate)) {
    count += 1;
    candidate = `${baseSlug}_${count}`;
  }

  reservedSlugs.add(candidate);

  return candidate;
};

const resolvePlannedSlugs = (
  existing: PlannedSlugDocument[],
  documents: PlannedSlugDocument[],
  warnings: string[],
  collectionName: string,
): void => {
  const plannedIds = new Set(documents.map(({ _id }) => _id));
  const currentSlugsById = new Map(
    existing.map(({ _id, slug }) => [String(_id), slug]),
  );
  const reservedSlugs = new Set(
    existing
      .filter(({ _id }) => !plannedIds.has(String(_id)))
      .map(({ slug }) => slug)
      .filter(Boolean),
  );

  for (const document of documents) {
    const currentSlug = currentSlugsById.get(document._id);

    if (!currentSlug) {
      continue;
    }

    reservedSlugs.add(currentSlug);
    document.slug = currentSlug;
  }

  for (const document of documents) {
    if (currentSlugsById.has(document._id)) {
      continue;
    }

    const requestedSlug = document.slug;
    const resolvedSlug = allocateUniqueSlug(requestedSlug, reservedSlugs);

    if (resolvedSlug !== requestedSlug) {
      warnings.push(
        `Changed duplicate slug "${requestedSlug}" to "${resolvedSlug}" for ${collectionName} record ${document._id}.`,
      );
      document.slug = resolvedSlug;
    }
  }
};

const resolveCollectionSlugs = async (
  collection: Collection<SlugDocument>,
  clientPortalId: string,
  documents: PlannedSlugDocument[],
  warnings: string[],
): Promise<void> => {
  if (documents.length === 0) {
    return;
  }

  const existing = await collection
    .find(
      { clientPortalId },
      { projection: { _id: 1, slug: 1, clientPortalId: 1 } },
    )
    .toArray();

  resolvePlannedSlugs(
    existing.map(({ _id, slug }) => ({ _id: String(_id), slug })),
    documents,
    warnings,
    collection.collectionName,
  );
};

export const resolveImportSlugs = async (
  db: Db,
  plan: WordPressImportPlan,
): Promise<void> => {
  await Promise.all([
    resolveCollectionSlugs(
      db.collection<SlugDocument>('cms_posts'),
      plan.clientPortalId,
      plan.posts,
      plan.warnings,
    ),
    resolveCollectionSlugs(
      db.collection<SlugDocument>('cms_pages'),
      plan.clientPortalId,
      plan.pages,
      plan.warnings,
    ),
    resolveCollectionSlugs(
      db.collection<SlugDocument>('cms_categories'),
      plan.clientPortalId,
      plan.categories,
      plan.warnings,
    ),
    resolveCollectionSlugs(
      db.collection<SlugDocument>('cms_tags'),
      plan.clientPortalId,
      plan.tags,
      plan.warnings,
    ),
  ]);
};
