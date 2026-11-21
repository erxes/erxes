/**
 * `tags` of core's record types → `core_tags`; plugin types are each plugin's own. Untyped tags
 * (old "any record" tags) become customer tags. A name already used for that type merges into
 * the existing tag through the id map. `brands` become tags named `Brand: <name>` of each type,
 * so a record's `scopeBrandIds` survive as tags. Core tags are flat, so parents are dropped.
 */
import { inOrder } from '~/lib/sequence';
import { remember } from './idMap';
import { insert, MINE, readAll, type Run, unit } from './run';
import { createdOf, idOf, optionalId, readOr, record, text, when } from './values';

export type TagType = 'customer' | 'company' | 'product';

/** Old tag types core keeps, and the type each becomes. */
const CORE_TAG_TYPES: Record<string, TagType> = {
  'core:customer': 'customer',
  'core:contacts.customer': 'customer',
  'contacts:customer': 'customer',
  'core:company': 'company',
  'core:contacts.company': 'company',
  'contacts:company': 'company',
  'core:product': 'product',
  'products:product': 'product',
};

/** Old type prefixes and the plugin that owns them now. */
const PLUGIN_OF: Record<string, string> = {
  inbox: 'frontline',
  frontline: 'frontline',
  sales: 'sales',
  cards: 'sales',
  tickets: 'frontline',
  tasks: 'operation',
  operation: 'operation',
};

const Tag = record({
  name: text,
  type: text,
  colorCode: text,
  parentId: optionalId,
  createdAt: when,
  updatedAt: when,
});

const Brand = record({ name: text, createdAt: when, userId: optionalId });

/** The core type of an old tag, or why it isn't core's. */
export const tagTypeOf = (type: string | null): TagType | { skip: string } => {
  if (!type) return 'customer';

  const core = CORE_TAG_TYPES[type];

  if (core) return core;

  const prefix = type.split(':')[0] ?? type;
  const plugin = PLUGIN_OF[prefix];

  return { skip: plugin ? `plugin:${plugin} (${type})` : `no core or plugin place for ${type}` };
};

/** The tag a brand becomes for one record type. */
export const brandTagId = (brandId: string, type: TagType) =>
  type === 'customer' ? brandId : `${brandId}_${type}`;

interface TagRow {
  id: string;
  type: TagType;
  name: string;
  color: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  collection: string;
}

const writeTags = async (run: Run, tags: TagRow[]) => {
  const { rows } = await run.pg.query<{ id: string; key: string }>(
    `SELECT id, type || ':' || lower(name) AS key FROM core_tags WHERE ${MINE}`,
  );

  const byName = new Map(rows.map((row) => [row.key, row.id]));
  const merged: [string, string][] = [];

  const fresh = tags.filter((tag) => {
    const key = `${tag.type}:${tag.name.toLowerCase()}`;
    const owner = byName.get(key);

    if (owner && owner !== tag.id) {
      merged.push([tag.id, owner]);
      run.report.note(tag.collection, 'name already used for this type; merged', tag.id);

      return false;
    }

    byName.set(key, tag.id);

    return true;
  });

  await unit(run, async () => {
    await inOrder(['tags', 'brands'], (collection) => {
      const mine = fresh.filter((tag) => tag.collection === collection);

      return insert(run, {
        collection,
        table: 'core_tags',
        columns: ['id', 'type', 'name', 'color_code', 'created_at', 'updated_at'],
        rows: mine.map((tag) => [
          tag.id,
          tag.type,
          tag.name,
          tag.color,
          tag.createdAt,
          tag.updatedAt ?? tag.createdAt,
        ]),
        keys: mine.map((tag) => tag.id),
      });
    });
    await remember(run, 'tags', 'tag', merged);
  });
};

const readTags = async (run: Run): Promise<TagRow[]> => {
  const docs = await readAll(run, 'tags');

  run.report.of('tags', 'core_tags');
  run.report.seen('tags', docs.length);

  return docs.flatMap((raw) => {
    const tag = readOr(Tag, raw);

    if (!tag?.name) {
      run.report.skip('tags', 'no name', idOf(raw));

      return [];
    }

    const type = tagTypeOf(tag.type);

    if (typeof type === 'object') {
      run.report.skip('tags', type.skip, tag.id);

      return [];
    }

    if (!tag.type) run.report.note('tags', 'untyped tag; made a customer tag', tag.id);

    if (tag.parentId) run.report.note('tags', 'parent dropped: core tags are flat', tag.id);

    const createdAt = createdOf(tag.id, tag.createdAt, tag.updatedAt);

    return [
      {
        id: tag.id,
        type,
        name: tag.name,
        color: tag.colorCode,
        createdAt,
        updatedAt: tag.updatedAt,
        collection: 'tags',
      },
    ];
  });
};

const readBrands = async (run: Run): Promise<TagRow[]> => {
  const docs = await readAll(run, 'brands');

  run.report.of('brands', 'core_tags (Brand: …)');
  run.report.seen('brands', docs.length);

  return docs.flatMap((raw) => {
    const brand = readOr(Brand, raw);

    if (!brand?.name) return [];

    return (['customer', 'company', 'product'] as const).map((type) => ({
      id: brandTagId(brand.id, type),
      type,
      name: `Brand: ${brand.name}`,
      color: null,
      createdAt: createdOf(brand.id, brand.createdAt),
      updatedAt: null,
      collection: 'brands',
    }));
  });
};

/** Imports core tags and brand tags. */
export const importTags = async (run: Run) => {
  await writeTags(run, [...(await readTags(run)), ...(await readBrands(run))]);
};
