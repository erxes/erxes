import {
  buildWordPressAcfFieldDefinitions,
  resolveWordPressAcfFieldKey,
  type WordPressAcfFieldDefinition,
} from './acf';
import { generateId } from './generateId';
import {
  createCmsSlug,
  createWordPressCode,
  normalizeSourceSite,
  normalizeWordPressCode,
  normalizeWordPressSlug,
} from './idMap';
import {
  ErxesCategoryDocument,
  ErxesCustomFieldDefinition,
  ErxesCustomFieldGroupDocument,
  ErxesCustomPostTypeDocument,
  ErxesMenuDocument,
  ErxesPageDocument,
  ErxesPostDocument,
  ErxesTagDocument,
  ErxesTranslationDocument,
  WordPressExport,
  WordPressImportPlan,
  WordPressItem,
  WordPressMappingDocument,
  WordPressMediaSource,
  WordPressTerm,
} from './types';
import {
  buildWordPressPolylangPlan,
  WordPressLanguageGroup,
  WordPressPolylangPlan,
} from './polylang';
import { normalizeWordPressContent } from './normalizeContent';

interface BuildImportPlanOptions {
  clientPortalId: string;
  adminUserId: string;
  now?: Date;
  existingMappings?: WordPressMappingDocument[];
  idGenerator?: () => string;
}

const NON_CONTENT_POST_TYPES = new Set([
  'acf-field',
  'acf-field-group',
  'attachment',
  'custom_css',
  'customize_changeset',
  'nav_menu_item',
  'oembed_cache',
  'revision',
  'user_request',
  'wp_block',
  'wp_font_face',
  'wp_font_family',
  'wp_global_styles',
  'wp_navigation',
  'wp_template',
  'wp_template_part',
]);

const IMPORTABLE_STATUSES = new Set([
  'draft',
  'future',
  'pending',
  'private',
  'publish',
  'trash',
]);

const firstMetaValue = (item: WordPressItem, key: string): string =>
  item.meta[key]?.[0] || '';

const titleFromCode = (value: string): string =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .split('-')
    .filter(Boolean)
    .join('-');

const getMediaFileName = (item: WordPressItem): string => {
  try {
    return (
      decodeURIComponent(
        new URL(item.attachmentUrl).pathname.split('/').pop() || '',
      ) ||
      item.slug ||
      `wordpress-media-${item.id}`
    );
  } catch {
    return item.slug || `wordpress-media-${item.id}`;
  }
};

const parseWordPressDate = (
  gmtValue: string,
  localValue: string,
): Date | undefined => {
  const value = gmtValue || localValue;

  if (!value || value.startsWith('0000-00-00')) {
    return undefined;
  }

  const timezoneSuffix = gmtValue ? 'Z' : '';
  const normalized = value.includes('T')
    ? value
    : `${value.replace(' ', 'T')}${timezoneSuffix}`;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const mapStatus = (item: WordPressItem): ErxesPostDocument['status'] => {
  if (item.status === 'publish') {
    return item.postPassword ? 'draft' : 'published';
  }

  if (item.status === 'future') {
    return 'scheduled';
  }

  if (item.status === 'trash') {
    return 'archived';
  }

  return 'draft';
};

const publicMetaEntries = (item: WordPressItem): [string, string[]][] =>
  Object.entries(item.meta).filter(
    ([key]) => key.trim().length > 0 && !key.startsWith('_'),
  );

type ResolveTargetId = (
  sourceType: string,
  sourceId: string,
  targetCollection: string,
) => string;

interface TargetReference {
  sourceType: string;
  sourceId: string;
  targetCollection: string;
}

interface MappingBase {
  sourceSite: string;
  clientPortalId: string;
  updatedAt: Date;
  existingMappings: Map<string, WordPressMappingDocument>;
  idGenerator: () => string;
}

const mappingKey = (
  sourceType: string,
  sourceId: string,
  targetCollection: string,
): string => `${sourceType}\u0000${sourceId}\u0000${targetCollection}`;

interface CustomFieldReference {
  acfFieldKey?: string;
  fieldId: string;
  metaKey: string;
  sourceId: string;
  sourceType: string;
}

const resolveCustomFieldReference = (
  item: WordPressItem,
  metaKey: string,
  resolveTargetId: ResolveTargetId,
): CustomFieldReference => {
  const acfFieldKey = resolveWordPressAcfFieldKey(item, metaKey);

  if (acfFieldKey) {
    return {
      acfFieldKey,
      fieldId: acfFieldKey,
      metaKey,
      sourceId: acfFieldKey,
      sourceType: 'acf-field',
    };
  }

  const sourceType = `field:${item.postType}`;

  return {
    fieldId: resolveTargetId(
      sourceType,
      metaKey,
      'cms_custom_field_groups.fields',
    ),
    metaKey,
    sourceId: metaKey,
    sourceType,
  };
};

const buildCustomFieldsData = (
  item: WordPressItem,
  resolveTargetId: ResolveTargetId,
) =>
  publicMetaEntries(item).map(([key, values]) => {
    const reference = resolveCustomFieldReference(item, key, resolveTargetId);

    return {
      field: reference.fieldId,
      value: values.length === 1 ? values[0] : values,
    };
  });

const createUniqueFieldCode = (
  baseCode: string,
  fieldId: string,
  usedCodes: Set<string>,
): string => {
  if (!usedCodes.has(baseCode)) {
    usedCodes.add(baseCode);
    return baseCode;
  }

  const suffix = normalizeWordPressCode(fieldId);
  let candidate = `${baseCode}_${suffix}`;
  let duplicateCount = 1;

  while (usedCodes.has(candidate)) {
    duplicateCount += 1;
    candidate = `${baseCode}_${suffix}_${duplicateCount}`;
  }

  usedCodes.add(candidate);
  return candidate;
};

const buildFieldDefinitions = (
  postType: string,
  items: WordPressItem[],
  resolveTargetId: ResolveTargetId,
  acfDefinitions: Map<string, WordPressAcfFieldDefinition>,
): ErxesCustomFieldDefinition[] => {
  const references = new Map<string, CustomFieldReference>();
  const usedCodes = new Set<string>();

  for (const item of items) {
    for (const [key] of publicMetaEntries(item)) {
      const reference = resolveCustomFieldReference(item, key, resolveTargetId);

      if (!references.has(reference.fieldId)) {
        references.set(reference.fieldId, reference);
      }
    }
  }

  return [...references.values()]
    .sort(
      (first, second) =>
        first.metaKey.localeCompare(second.metaKey) ||
        first.fieldId.localeCompare(second.fieldId),
    )
    .map((reference) => {
      const acfDefinition = reference.acfFieldKey
        ? acfDefinitions.get(reference.acfFieldKey)
        : undefined;
      const baseCode = normalizeWordPressCode(
        acfDefinition?.name || reference.metaKey,
      );
      const code = createUniqueFieldCode(
        baseCode,
        reference.fieldId,
        usedCodes,
      );

      return {
        _id: reference.fieldId,
        label: acfDefinition?.label || titleFromCode(reference.metaKey),
        code,
        type: acfDefinition?.type || 'text',
        description:
          acfDefinition?.description ||
          (reference.acfFieldKey
            ? `Imported from WordPress ACF field "${reference.acfFieldKey}" for post meta key "${reference.metaKey}".`
            : `Imported from WordPress post meta key "${reference.metaKey}".`),
        isRequired: acfDefinition?.isRequired || false,
        options: acfDefinition?.options || [],
      };
    });
};

const createMapping = (
  base: MappingBase,
  sourceType: string,
  sourceId: string,
  targetCollection: string,
  targetId: string,
  sourceAuthorLogin?: string,
): WordPressMappingDocument => {
  const existing = base.existingMappings.get(
    mappingKey(sourceType, sourceId, targetCollection),
  );

  return {
    _id: existing?._id || base.idGenerator(),
    source: 'wordpress',
    sourceSite: base.sourceSite,
    clientPortalId: base.clientPortalId,
    sourceType,
    sourceId,
    targetCollection,
    targetId,
    sourceAuthorLogin,
    targetUrl: existing?.targetUrl,
    mediaName: existing?.mediaName,
    mediaType: existing?.mediaType,
    mediaSize: existing?.mediaSize,
    updatedAt: base.updatedAt,
  };
};

const uniqueTerms = (terms: WordPressTerm[]): WordPressTerm[] => {
  const byTaxonomyAndSlug = new Map<string, WordPressTerm>();

  for (const term of terms) {
    const key = `${term.taxonomy}:${term.slug}`;
    const existing = byTaxonomyAndSlug.get(key);

    if (!existing || (!existing.id && term.id)) {
      byTaxonomyAndSlug.set(key, term);
    }
  }

  return [...byTaxonomyAndSlug.values()];
};

const inferReferencedTerms = (items: WordPressItem[]): WordPressTerm[] =>
  items.flatMap((item) =>
    item.taxonomies.map((reference) => ({
      id: '',
      taxonomy: reference.taxonomy,
      slug: reference.slug,
      parentSlug: '',
      name: reference.name,
      description: '',
    })),
  );

const allocateUniqueSlugs = (items: WordPressItem[]): Map<string, string> => {
  const result = new Map<string, string>();

  for (const item of items) {
    result.set(
      item.id,
      normalizeWordPressSlug(item.slug || slugify(item.title), item.id),
    );
  }

  return result;
};

const translationEntries = <T>(
  group: WordPressLanguageGroup<T>,
): WordPressLanguageGroup<T>['entries'] => {
  const languages = new Set<string>([group.base.language]);

  return group.entries.filter((entry) => {
    if (entry === group.base || languages.has(entry.language)) {
      return false;
    }

    languages.add(entry.language);
    return true;
  });
};

const buildMenus = (
  clientPortalId: string,
  items: WordPressItem[],
  itemTargetIds: Map<string, string>,
  termTargetIds: Map<string, string>,
  resolveTargetId: ResolveTargetId,
  warnings: string[],
): ErxesMenuDocument[] => {
  const menuItems = items.filter(
    ({ id, postType }) => Boolean(id) && postType === 'nav_menu_item',
  );
  const menuTargetIds = new Map(
    menuItems.map((item) => [
      item.id,
      resolveTargetId('nav_menu_item', item.id, 'cms_menu_items'),
    ]),
  );

  return menuItems.map((item) => {
    const menuType = firstMetaValue(item, '_menu_item_type');
    const objectType = firstMetaValue(item, '_menu_item_object');
    const objectId = firstMetaValue(item, '_menu_item_object_id');
    const explicitUrl = firstMetaValue(item, '_menu_item_url');
    const target = firstMetaValue(item, '_menu_item_target') || '_self';
    const menuReference = item.taxonomies.find(
      ({ taxonomy }) => taxonomy === 'nav_menu',
    );
    let linkType: ErxesMenuDocument['linkType'] = 'URL';
    let contentTypeId: string | undefined;

    if (menuType === 'post_type' && objectType === 'page') {
      linkType = 'PAGE';
      contentTypeId = itemTargetIds.get(objectId);
    } else if (menuType === 'post_type') {
      linkType = 'POST';
      contentTypeId = itemTargetIds.get(objectId);
    } else if (menuType === 'taxonomy' && objectType === 'category') {
      linkType = 'CATEGORY';
      contentTypeId = termTargetIds.get(`category:${objectId}`);
    } else if (menuType === 'taxonomy' && objectType === 'post_tag') {
      linkType = 'TAG';
      contentTypeId = termTargetIds.get(`post_tag:${objectId}`);
    }

    if (linkType !== 'URL' && !contentTypeId) {
      warnings.push(
        `Menu item ${item.id} references missing ${objectType} ${objectId}; imported as a URL.`,
      );
      linkType = 'URL';
    }

    return {
      _id: menuTargetIds.get(item.id) as string,
      clientPortalId,
      label: item.title || `Menu item ${item.id}`,
      contentType: linkType,
      contentTypeId,
      type: linkType === 'URL' ? undefined : 'cms',
      linkType,
      kind:
        menuReference?.slug ||
        slugify(menuReference?.name || '') ||
        'wordpress-menu',
      url: linkType === 'URL' ? explicitUrl || item.link || '#' : undefined,
      parentId: menuTargetIds.get(
        firstMetaValue(item, '_menu_item_menu_item_parent'),
      ),
      order: item.menuOrder,
      openInNewTab: target === '_blank',
      target,
    };
  });
};

const createTargetResolvers = (
  mappings: WordPressMappingDocument[],
  idGenerator: () => string,
) => {
  const existingMappings = new Map(
    mappings.map((mapping) => [
      mappingKey(
        mapping.sourceType,
        mapping.sourceId,
        mapping.targetCollection,
      ),
      mapping,
    ]),
  );
  const allocatedTargetIds = new Map<string, string>();
  const resolveTargetId: ResolveTargetId = (
    sourceType,
    sourceId,
    targetCollection,
  ) => {
    const key = mappingKey(sourceType, sourceId, targetCollection);
    const allocated = allocatedTargetIds.get(key);

    if (allocated) {
      return allocated;
    }

    const targetId = existingMappings.get(key)?.targetId || idGenerator();
    allocatedTargetIds.set(key, targetId);

    return targetId;
  };
  const resolveSharedTargetId = (references: TargetReference[]): string => {
    const keys = references.map(({ sourceType, sourceId, targetCollection }) =>
      mappingKey(sourceType, sourceId, targetCollection),
    );
    const existingTargetIds = new Set(
      keys
        .map(
          (key) =>
            allocatedTargetIds.get(key) || existingMappings.get(key)?.targetId,
        )
        .filter((targetId): targetId is string => Boolean(targetId)),
    );

    if (existingTargetIds.size > 1) {
      throw new Error(
        'This target already contains separately imported language variants. Use a clean CMS target for the translation-aware import.',
      );
    }

    const targetId = [...existingTargetIds][0] || idGenerator();

    for (const key of keys) {
      allocatedTargetIds.set(key, targetId);
    }

    return targetId;
  };

  return { existingMappings, resolveTargetId, resolveSharedTargetId };
};

const selectImportCandidates = (
  items: WordPressItem[],
  skipped: Record<string, number>,
): WordPressItem[] =>
  items.filter((item) => {
    if (!item.id) {
      skipped.missingId = (skipped.missingId || 0) + 1;
      return false;
    }

    if (!item.postType) {
      skipped.missingPostType = (skipped.missingPostType || 0) + 1;
      return false;
    }

    if (item.postType === 'attachment' || item.postType === 'nav_menu_item') {
      return false;
    }

    if (
      NON_CONTENT_POST_TYPES.has(item.postType) ||
      !IMPORTABLE_STATUSES.has(item.status)
    ) {
      skipped[item.postType || 'unknownPostType'] =
        (skipped[item.postType || 'unknownPostType'] || 0) + 1;
      return false;
    }

    return true;
  });

const allocateItemTargetIds = (
  groups: WordPressLanguageGroup<WordPressItem>[],
  resolveSharedTargetId: (references: TargetReference[]) => string,
): Map<string, string> => {
  const itemTargetIds = new Map<string, string>();

  for (const group of groups) {
    const targetCollection =
      group.base.value.postType === 'page' ? 'cms_pages' : 'cms_posts';
    const targetId = resolveSharedTargetId(
      group.entries.map(({ value }) => ({
        sourceType: `post:${value.postType}`,
        sourceId: value.id,
        targetCollection,
      })),
    );

    for (const { value } of group.entries) {
      itemTargetIds.set(value.id, targetId);
    }
  }

  return itemTargetIds;
};

const allocateTermTargetIds = (
  groups: WordPressLanguageGroup<WordPressTerm>[],
  resolveSharedTargetId: (references: TargetReference[]) => string,
): Map<string, string> => {
  const termTargetIds = new Map<string, string>();

  for (const group of groups) {
    const targetCollection =
      group.base.value.taxonomy === 'category' ? 'cms_categories' : 'cms_tags';
    const targetId = resolveSharedTargetId(
      group.entries.map(({ value }) => ({
        sourceType: `term:${value.taxonomy}`,
        sourceId: value.id || value.slug,
        targetCollection,
      })),
    );

    for (const { value } of group.entries) {
      termTargetIds.set(`${value.taxonomy}:${value.slug}`, targetId);

      if (value.id) {
        termTargetIds.set(`${value.taxonomy}:${value.id}`, targetId);
      }
    }
  }

  return termTargetIds;
};

type RelatedTermIds = (
  item: WordPressItem,
  taxonomy: 'category' | 'post_tag',
) => string[];

interface BuildPostsOptions {
  clientPortalId: string;
  adminUserId: string;
  itemTargetIds: Map<string, string>;
  postSlugs: Map<string, string>;
  postTypeTargetIds: Map<string, string>;
  relatedTermIds: RelatedTermIds;
  resolveTargetId: ResolveTargetId;
  warnings: string[];
  skipped: Record<string, number>;
}

interface BuildPagesOptions {
  clientPortalId: string;
  adminUserId: string;
  itemTargetIds: Map<string, string>;
  pageSlugs: Map<string, string>;
  resolveTargetId: ResolveTargetId;
  warnings: string[];
  skipped: Record<string, number>;
}

interface TranslationBuildResult {
  translations: ErxesTranslationDocument[];
  translationMappings: WordPressMappingDocument[];
}

const createRelatedTermResolver = (
  itemGroups: WordPressLanguageGroup<WordPressItem>[],
  termTargetIds: Map<string, string>,
): RelatedTermIds => {
  const itemGroupBySourceId = new Map(
    itemGroups.flatMap((group) =>
      group.entries.map(({ value }) => [value.id, group] as const),
    ),
  );

  return (item, taxonomy) => [
    ...new Set(
      (
        itemGroupBySourceId.get(item.id)?.entries.map(({ value }) => value) || [
          item,
        ]
      )
        .flatMap(({ taxonomies }) => taxonomies)
        .filter((reference) => reference.taxonomy === taxonomy)
        .map(({ slug }) => termTargetIds.get(`${taxonomy}:${slug}`))
        .filter((value): value is string => Boolean(value)),
    ),
  ];
};

const buildPosts = (
  items: WordPressItem[],
  {
    clientPortalId,
    adminUserId,
    itemTargetIds,
    postSlugs,
    postTypeTargetIds,
    relatedTermIds,
    resolveTargetId,
    warnings,
    skipped,
  }: BuildPostsOptions,
): ErxesPostDocument[] =>
  items.map((item) => {
    const status = mapStatus(item);
    const publishedDate = parseWordPressDate(item.postDateGmt, item.postDate);
    const updatedDate = parseWordPressDate(
      item.modifiedDateGmt,
      item.modifiedDate,
    );

    if (item.commentCount > 0) {
      skipped.comments = (skipped.comments || 0) + item.commentCount;
    }

    if (item.postPassword) {
      warnings.push(
        `Password-protected WordPress ${item.postType} ${item.id} was imported as a draft because erxes CMS has no equivalent password status.`,
      );
    }

    return {
      _id: itemTargetIds.get(item.id) as string,
      clientPortalId,
      count: Number.parseInt(item.id, 10) || 0,
      title: item.title || `Untitled ${item.postType} ${item.id}`,
      slug: postSlugs.get(item.id) as string,
      content: normalizeWordPressContent(item.content),
      excerpt: normalizeWordPressContent(item.excerpt),
      categoryIds: relatedTermIds(item, 'category'),
      type: postTypeTargetIds.get(item.postType) || 'post',
      status,
      tagIds: relatedTermIds(item, 'post_tag'),
      authorKind: 'user',
      authorId: adminUserId,
      featured: item.isSticky,
      publishedDate: status === 'published' ? publishedDate : undefined,
      scheduledDate: status === 'scheduled' ? publishedDate : undefined,
      customFieldsData: buildCustomFieldsData(item, resolveTargetId),
      createdAt: publishedDate,
      updatedAt: updatedDate || publishedDate,
    };
  });

const buildPages = (
  items: WordPressItem[],
  {
    clientPortalId,
    adminUserId,
    itemTargetIds,
    pageSlugs,
    resolveTargetId,
    warnings,
    skipped,
  }: BuildPagesOptions,
): ErxesPageDocument[] =>
  items.map((item) => {
    const status = mapStatus(item);
    const createdAt = parseWordPressDate(item.postDateGmt, item.postDate);

    if (item.commentCount > 0) {
      skipped.comments = (skipped.comments || 0) + item.commentCount;
    }

    if (item.postPassword) {
      warnings.push(
        `Password-protected WordPress page ${item.id} was imported as a draft because erxes CMS has no equivalent password status.`,
      );
    }

    return {
      _id: itemTargetIds.get(item.id) as string,
      clientPortalId,
      name: item.title || `Untitled page ${item.id}`,
      parentId: itemTargetIds.get(item.parentId),
      description: normalizeWordPressContent(item.excerpt),
      content: normalizeWordPressContent(item.content),
      slug: pageSlugs.get(item.id) as string,
      status,
      createdUserId: adminUserId,
      customFieldsData: buildCustomFieldsData(item, resolveTargetId),
      createdAt,
      updatedAt:
        parseWordPressDate(item.modifiedDateGmt, item.modifiedDate) ||
        createdAt,
    };
  });

const buildItemTranslations = (
  itemGroups: WordPressLanguageGroup<WordPressItem>[],
  itemTargetIds: Map<string, string>,
  resolveTargetId: ResolveTargetId,
  mappingBase: MappingBase,
): TranslationBuildResult => {
  const translations: ErxesTranslationDocument[] = [];
  const translationMappings: WordPressMappingDocument[] = [];

  for (const group of itemGroups) {
    const baseItem = group.base.value;
    const objectId = itemTargetIds.get(baseItem.id) as string;
    const type = baseItem.postType === 'page' ? 'page' : 'post';

    for (const { language, value: item } of translationEntries(group)) {
      const translationId = resolveTargetId(
        `translation:${type}`,
        item.id,
        'cms_translations',
      );
      const isPage = type === 'page';

      translations.push({
        _id: translationId,
        objectId,
        language,
        title: item.title,
        content: normalizeWordPressContent(
          isPage ? item.excerpt : item.content,
        ),
        excerpt: isPage ? undefined : normalizeWordPressContent(item.excerpt),
        customFieldsData: buildCustomFieldsData(item, resolveTargetId),
        type,
        createdAt: parseWordPressDate(item.postDateGmt, item.postDate),
        updatedAt:
          parseWordPressDate(item.modifiedDateGmt, item.modifiedDate) ||
          parseWordPressDate(item.postDateGmt, item.postDate),
      });
      translationMappings.push(
        createMapping(
          mappingBase,
          `translation:${type}`,
          item.id,
          'cms_translations',
          translationId,
        ),
      );
    }
  }

  return { translations, translationMappings };
};

const buildTermTranslations = (
  termGroups: WordPressPolylangPlan['termGroups'],
  termTargetIds: Map<string, string>,
  resolveTargetId: ResolveTargetId,
  mappingBase: MappingBase,
): TranslationBuildResult => {
  const translations: ErxesTranslationDocument[] = [];
  const translationMappings: WordPressMappingDocument[] = [];

  for (const group of termGroups) {
    const baseTerm = group.base.value;
    const objectId = termTargetIds.get(
      `${baseTerm.taxonomy}:${baseTerm.id || baseTerm.slug}`,
    ) as string;
    const type = baseTerm.taxonomy === 'category' ? 'category' : 'tag';

    for (const { language, value: term } of translationEntries(group)) {
      const sourceId = term.id || term.slug;
      const translationId = resolveTargetId(
        `translation:${type}`,
        sourceId,
        'cms_translations',
      );

      translations.push({
        _id: translationId,
        objectId,
        language,
        title: term.name || titleFromCode(term.slug),
        content: type === 'category' ? term.description : '',
        type,
      });
      translationMappings.push(
        createMapping(
          mappingBase,
          `translation:${type}`,
          sourceId,
          'cms_translations',
          translationId,
        ),
      );
    }
  }

  return { translations, translationMappings };
};

const buildTranslations = (
  polylang: WordPressPolylangPlan,
  itemTargetIds: Map<string, string>,
  termTargetIds: Map<string, string>,
  resolveTargetId: ResolveTargetId,
  mappingBase: MappingBase,
): TranslationBuildResult => {
  const itemTranslations = buildItemTranslations(
    polylang.itemGroups,
    itemTargetIds,
    resolveTargetId,
    mappingBase,
  );
  const termTranslations = buildTermTranslations(
    polylang.termGroups,
    termTargetIds,
    resolveTargetId,
    mappingBase,
  );

  return {
    translations: [
      ...itemTranslations.translations,
      ...termTranslations.translations,
    ],
    translationMappings: [
      ...itemTranslations.translationMappings,
      ...termTranslations.translationMappings,
    ],
  };
};

const buildCustomFieldGroups = (
  candidates: WordPressItem[],
  sourceSite: string,
  clientPortalId: string,
  itemTargetIds: Map<string, string>,
  postTypeTargetIds: Map<string, string>,
  resolveTargetId: ResolveTargetId,
  acfDefinitions: Map<string, WordPressAcfFieldDefinition>,
): {
  customFieldGroups: ErxesCustomFieldGroupDocument[];
  groupedItems: Map<string, WordPressItem[]>;
} => {
  const customFieldGroups: ErxesCustomFieldGroupDocument[] = [];
  const groupedItems = new Map<string, WordPressItem[]>();

  for (const item of candidates) {
    groupedItems.set(item.postType, [
      ...(groupedItems.get(item.postType) || []),
      item,
    ]);
  }

  for (const [postType, items] of groupedItems) {
    const fields = buildFieldDefinitions(
      postType,
      items,
      resolveTargetId,
      acfDefinitions,
    );

    if (fields.length === 0) {
      continue;
    }

    const isPage = postType === 'page';
    const groupCode = createWordPressCode(
      sourceSite,
      normalizeWordPressCode(`wordpress_${postType}_fields`),
    );
    const groupId = resolveTargetId(
      'custom-field-group',
      groupCode,
      'cms_custom_field_groups',
    );

    customFieldGroups.push({
      _id: groupId,
      clientPortalId,
      label: `WordPress ${titleFromCode(postType)} Fields`,
      code: groupCode,
      order: customFieldGroups.length + 1,
      customPostTypeIds: isPage
        ? []
        : [postTypeTargetIds.get(postType) || 'post'],
      enabledPageIds: isPage
        ? [
            ...new Set(
              items
                .map(({ id }) => itemTargetIds.get(id))
                .filter((value): value is string => Boolean(value)),
            ),
          ]
        : [],
      enabledPostIds: [],
      type: 'wordpress',
      fields,
    });
  }

  return { customFieldGroups, groupedItems };
};

const buildMediaPlan = (
  items: WordPressItem[],
  candidates: WordPressItem[],
  itemTargetIds: Map<string, string>,
): WordPressMediaSource[] => {
  const candidateById = new Map(candidates.map((item) => [item.id, item]));
  const featuredByThumbnailId = new Map<string, WordPressItem[]>();

  for (const candidate of candidates) {
    const thumbnailId = firstMetaValue(candidate, '_thumbnail_id');

    if (thumbnailId) {
      featuredByThumbnailId.set(thumbnailId, [
        ...(featuredByThumbnailId.get(thumbnailId) || []),
        candidate,
      ]);
    }
  }

  return items
    .filter(
      ({ id, postType, attachmentUrl }) =>
        Boolean(id) && postType === 'attachment' && Boolean(attachmentUrl),
    )
    .map((item) => {
      const featuredTargets = [
        ...new Map(
          (featuredByThumbnailId.get(item.id) || []).map((candidate) => {
            const collection =
              candidate.postType === 'page'
                ? ('cms_pages' as const)
                : ('cms_posts' as const);
            const targetId = itemTargetIds.get(candidate.id) as string;

            return [
              `${collection}:${targetId}`,
              { collection, targetId },
            ] as const;
          }),
        ).values(),
      ];
      const parentTargetId = itemTargetIds.get(item.parentId);

      return {
        sourceId: item.id,
        sourceUrl: item.attachmentUrl,
        fileName: getMediaFileName(item),
        parentTarget: parentTargetId
          ? {
              collection:
                candidateById.get(item.parentId)?.postType === 'page'
                  ? ('cms_pages' as const)
                  : ('cms_posts' as const),
              targetId: parentTargetId,
            }
          : undefined,
        featuredTargets,
      };
    });
};

const buildAuthorMappings = (
  authors: WordPressExport['authors'],
  candidates: WordPressItem[],
  adminUserId: string,
  mappingBase: MappingBase,
): WordPressMappingDocument[] => {
  const authorMappings = authors
    .filter(({ id, login }) => Boolean(id || login))
    .map((author) =>
      createMapping(
        mappingBase,
        'author',
        author.id || author.login,
        'users',
        adminUserId,
        author.login,
      ),
    );
  const mappedAuthorLogins = new Set(
    authorMappings
      .map(({ sourceAuthorLogin }) => sourceAuthorLogin)
      .filter((value): value is string => Boolean(value)),
  );

  for (const creatorLogin of new Set(
    candidates.map(({ creatorLogin }) => creatorLogin).filter(Boolean),
  )) {
    if (mappedAuthorLogins.has(creatorLogin)) {
      continue;
    }

    authorMappings.push(
      createMapping(
        mappingBase,
        'author',
        creatorLogin,
        'users',
        adminUserId,
        creatorLogin,
      ),
    );
  }

  return authorMappings;
};

const appendCustomFieldMappings = (
  mappings: WordPressMappingDocument[],
  groupedItems: Map<string, WordPressItem[]>,
  mappingBase: MappingBase,
  resolveTargetId: ResolveTargetId,
): void => {
  const references = new Map<string, CustomFieldReference>();

  for (const items of groupedItems.values()) {
    for (const item of items) {
      for (const [metaKey] of publicMetaEntries(item)) {
        const reference = resolveCustomFieldReference(
          item,
          metaKey,
          resolveTargetId,
        );
        const key = mappingKey(
          reference.sourceType,
          reference.sourceId,
          'cms_custom_field_groups.fields',
        );

        references.set(key, reference);
      }
    }
  }

  for (const reference of references.values()) {
    mappings.push(
      createMapping(
        mappingBase,
        reference.sourceType,
        reference.sourceId,
        'cms_custom_field_groups.fields',
        reference.fieldId,
      ),
    );
  }
};

const findUnsupportedTaxonomies = (terms: WordPressTerm[]): string[] => [
  ...new Set(
    terms
      .map(({ taxonomy }) => taxonomy)
      .filter(
        (taxonomy) =>
          taxonomy &&
          ![
            'category',
            'language',
            'nav_menu',
            'post_tag',
            'post_translations',
            'term_language',
            'term_translations',
          ].includes(taxonomy),
      ),
  ),
];

export const buildImportPlan = (
  wxr: WordPressExport,
  options: BuildImportPlanOptions,
): WordPressImportPlan => {
  const { clientPortalId, adminUserId } = options;
  const updatedAt = options.now || new Date();
  const idGenerator = options.idGenerator || generateId;
  const sourceSite = normalizeSourceSite(
    wxr.site.baseBlogUrl || wxr.site.baseSiteUrl || wxr.site.link,
  );
  const acfDefinitions = buildWordPressAcfFieldDefinitions(wxr.items);
  const warnings: string[] = [];
  const skipped: Record<string, number> = {};
  const mappings: WordPressMappingDocument[] = [];
  const { existingMappings, resolveTargetId, resolveSharedTargetId } =
    createTargetResolvers(options.existingMappings || [], idGenerator);
  const mappingBase: MappingBase = {
    sourceSite,
    clientPortalId,
    updatedAt,
    existingMappings,
    idGenerator,
  };

  if (!/^1(?:\.|$)/.test(wxr.site.wxrVersion.trim())) {
    warnings.push(
      `WXR version ${wxr.site.wxrVersion} is newer than the tested 1.x format; review the dry-run counts carefully.`,
    );
  }

  const candidates = selectImportCandidates(wxr.items, skipped);
  const allTerms = uniqueTerms([
    ...wxr.terms,
    ...inferReferencedTerms(wxr.items),
  ]);
  const polylang = buildWordPressPolylangPlan(wxr, candidates, allTerms);
  warnings.push(...polylang.warnings);
  const canonicalCandidates = polylang.itemGroups.map(({ base }) => base.value);
  const postCandidates = canonicalCandidates.filter(
    ({ postType }) => postType !== 'page',
  );
  const pageCandidates = canonicalCandidates.filter(
    ({ postType }) => postType === 'page',
  );
  const postSlugs = allocateUniqueSlugs(postCandidates);
  const pageSlugs = allocateUniqueSlugs(pageCandidates);
  const itemTargetIds = allocateItemTargetIds(
    polylang.itemGroups,
    resolveSharedTargetId,
  );
  const termTargetIds = allocateTermTargetIds(
    polylang.termGroups,
    resolveSharedTargetId,
  );
  const canonicalTerms = polylang.termGroups.map(({ base }) => base.value);
  const categories: ErxesCategoryDocument[] = canonicalTerms
    .filter(({ taxonomy }) => taxonomy === 'category')
    .map((term) => ({
      _id: termTargetIds.get(`category:${term.slug}`) as string,
      clientPortalId,
      name: term.name || titleFromCode(term.slug),
      slug: createCmsSlug(term.name || titleFromCode(term.slug)),
      description: term.description,
      parentId: term.parentSlug
        ? termTargetIds.get(`category:${term.parentSlug}`)
        : undefined,
      status: 'active' as const,
    }));
  const tags: ErxesTagDocument[] = canonicalTerms
    .filter(({ taxonomy }) => taxonomy === 'post_tag')
    .map((term) => ({
      _id: termTargetIds.get(`post_tag:${term.slug}`) as string,
      clientPortalId,
      name: term.name || titleFromCode(term.slug),
      slug: createCmsSlug(term.name || titleFromCode(term.slug)),
      createdUserId: adminUserId,
    }));

  const customPostTypeCodes = [
    ...new Set(
      postCandidates
        .map(({ postType }) => postType)
        .filter((postType) => postType !== 'post'),
    ),
  ].sort((first, second) => first.localeCompare(second));
  const usedCustomPostTypeCodes = new Set<string>();
  const customPostTypes: ErxesCustomPostTypeDocument[] =
    customPostTypeCodes.map((postType) => {
      const label = titleFromCode(postType);
      const baseCode = normalizeWordPressCode(postType);
      const code = usedCustomPostTypeCodes.has(baseCode)
        ? `${baseCode}_${usedCustomPostTypeCodes.size + 1}`
        : baseCode;

      usedCustomPostTypeCodes.add(code);

      return {
        _id: resolveTargetId(
          'custom-post-type',
          postType,
          'cms_custom_post_types',
        ),
        clientPortalId,
        label,
        name: postType,
        pluralLabel: label,
        code,
        description: `Imported WordPress custom post type "${postType}".`,
        isActive: true,
      };
    });
  const postTypeTargetIds = new Map(
    customPostTypes.map((postType) => [postType.name, postType._id]),
  );
  const relatedTermIds = createRelatedTermResolver(
    polylang.itemGroups,
    termTargetIds,
  );
  const posts = buildPosts(postCandidates, {
    clientPortalId,
    adminUserId,
    itemTargetIds,
    postSlugs,
    postTypeTargetIds,
    relatedTermIds,
    resolveTargetId,
    warnings,
    skipped,
  });
  const pages = buildPages(pageCandidates, {
    clientPortalId,
    adminUserId,
    itemTargetIds,
    pageSlugs,
    resolveTargetId,
    warnings,
    skipped,
  });
  const { translations, translationMappings } = buildTranslations(
    polylang,
    itemTargetIds,
    termTargetIds,
    resolveTargetId,
    mappingBase,
  );

  if (
    polylang.itemGroups.some(
      (group) =>
        group.base.value.postType === 'page' &&
        translationEntries(group).some(({ value }) => Boolean(value.content)),
    )
  ) {
    warnings.push(
      'The existing erxes page translation structure supports name, description, and custom fields but not the page body; translated WordPress page bodies were not stored.',
    );
  }

  const { customFieldGroups, groupedItems } = buildCustomFieldGroups(
    candidates,
    sourceSite,
    clientPortalId,
    itemTargetIds,
    postTypeTargetIds,
    resolveTargetId,
    acfDefinitions,
  );
  const media = buildMediaPlan(wxr.items, candidates, itemTargetIds);

  const menus = buildMenus(
    clientPortalId,
    wxr.items,
    itemTargetIds,
    termTargetIds,
    resolveTargetId,
    warnings,
  );
  const menuSourceItems = wxr.items.filter(
    ({ id, postType }) => Boolean(id) && postType === 'nav_menu_item',
  );
  const authorMappings = buildAuthorMappings(
    wxr.authors,
    candidates,
    adminUserId,
    mappingBase,
  );

  mappings.push(
    ...authorMappings,
    ...translationMappings,
    ...allTerms
      .filter(({ taxonomy }) => ['category', 'post_tag'].includes(taxonomy))
      .map((term) =>
        createMapping(
          mappingBase,
          `term:${term.taxonomy}`,
          term.id || term.slug,
          term.taxonomy === 'category' ? 'cms_categories' : 'cms_tags',
          termTargetIds.get(`${term.taxonomy}:${term.slug}`) as string,
        ),
      ),
    ...candidates.map((item) =>
      createMapping(
        mappingBase,
        `post:${item.postType}`,
        item.id,
        item.postType === 'page' ? 'cms_pages' : 'cms_posts',
        itemTargetIds.get(item.id) as string,
        item.creatorLogin,
      ),
    ),
    ...customPostTypes.map((postType) =>
      createMapping(
        mappingBase,
        'custom-post-type',
        postType.name,
        'cms_custom_post_types',
        postType._id,
      ),
    ),
    ...customFieldGroups.map((group) =>
      createMapping(
        mappingBase,
        'custom-field-group',
        group.code,
        'cms_custom_field_groups',
        group._id,
      ),
    ),
    ...menus.map((menu, index) =>
      createMapping(
        mappingBase,
        'nav_menu_item',
        menuSourceItems[index].id,
        'cms_menu_items',
        menu._id,
      ),
    ),
    ...media.map((item) =>
      createMapping(
        mappingBase,
        'attachment',
        item.sourceId,
        'storage',
        resolveTargetId('attachment', item.sourceId, 'storage'),
      ),
    ),
  );

  appendCustomFieldMappings(
    mappings,
    groupedItems,
    mappingBase,
    resolveTargetId,
  );

  const unsupportedTaxonomies = findUnsupportedTaxonomies(allTerms);

  if (unsupportedTaxonomies.length > 0) {
    warnings.push(
      `Skipped unsupported WordPress taxonomies: ${unsupportedTaxonomies.join(
        ', ',
      )}.`,
    );
  }

  return {
    sourceSite,
    clientPortalId,
    cmsUpdate: {
      name: wxr.site.title || 'Imported WordPress site',
      description: wxr.site.description,
      domain: wxr.site.baseBlogUrl || wxr.site.link,
      publicUrl: wxr.site.link || wxr.site.baseBlogUrl,
      language: polylang.defaultLanguage,
      languages: polylang.languages,
      allowComments: false,
    },
    categories,
    tags,
    customPostTypes,
    customFieldGroups,
    posts,
    pages,
    translations,
    menus,
    media,
    mappings,
    warnings,
    skipped,
  };
};
