import { BSON } from 'mongodb';
import { generateId } from '../wordpress/generateId';
import { createCmsSlug } from '../wordpress/idMap';
import {
  fingerprint,
  sourceFingerprint,
  targetFingerprint,
} from './fingerprint';
import { isRecord } from './options';
import {
  EntityKind,
  ImportOptions,
  ImportPlan,
  Mapping,
  RecordDocument,
  Snapshot,
  TARGET_COLLECTIONS,
  TargetCollection,
} from './types';

const text = (value: unknown): string =>
  typeof value === 'string' ? value : '';
const ids = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
const requiredText = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`${field} is missing or empty.`);
  return value;
};
const date = (value: unknown, fallback?: Date): Date | undefined => {
  if (value === undefined || value === null) return fallback;
  if (!(value instanceof Date) && typeof value !== 'string')
    throw new Error('Invalid date.');
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error('Invalid date.');
  return parsed;
};
const count = (value: unknown): number => {
  if (value === undefined) return 0;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    throw new Error('Invalid nonnegative integer count.');
  return value;
};
const clean = (document: RecordDocument): RecordDocument => {
  for (const key of Object.keys(document))
    if (document[key] === undefined) delete document[key];
  return document;
};

export const mappingId = (
  sourceDb: string,
  portal: string,
  kind: EntityKind,
  sourceId: string,
): string => fingerprint([sourceDb, portal, kind, sourceId]);

export const buildPlan = (
  snapshot: Snapshot,
  options: ImportOptions,
): ImportPlan => {
  const plan: ImportPlan = {
    mappings: [],
    warnings: [],
    errors: [],
    counts: {},
  };
  const { clientPortalId } = options;
  const prior = new Map(
    snapshot.mappings.map((mapping) => [mapping._id, mapping]),
  );
  const allocated = new Map<string, string>();
  const targetById = new Map<TargetCollection, Map<string, RecordDocument>>();
  for (const collection of TARGET_COLLECTIONS) {
    targetById.set(
      collection,
      new Map(
        snapshot.target[collection].map((document) => [document._id, document]),
      ),
    );
  }
  const key = (kind: EntityKind, id: string): string =>
    mappingId(snapshot.sourceDb, clientPortalId, kind, id);
  const targetId = (kind: EntityKind, id: string): string => {
    const identity = key(kind, id);
    const existing = allocated.get(identity);
    if (existing) return existing;
    const allocatedId = prior.get(identity)?.targetDocument._id || generateId();
    allocated.set(identity, allocatedId);
    return allocatedId;
  };
  const now = new Date();
  const timestamps = (
    kind: EntityKind,
    source: RecordDocument,
  ): Record<string, Date | undefined> => {
    const previous = prior.get(key(kind, source._id));
    const fallback = date(previous?.targetDocument.createdAt, now);
    const createdAt = date(source.createdDate ?? source.createdAt, fallback);
    return {
      createdAt,
      updatedAt: date(source.modifiedDate ?? source.updatedAt, createdAt),
    };
  };
  const attempt = (label: string, action: () => void): void => {
    try {
      action();
    } catch (error) {
      plan.errors.push(
        `${label}: ${
          error instanceof Error ? error.message : 'Invalid record.'
        }`,
      );
    }
  };
  const add = (
    kind: EntityKind,
    source: RecordDocument,
    collection: TargetCollection,
    document: RecordDocument,
    urls: { sourceUrl?: string; targetUrl?: string } = {},
  ): void => {
    clean(document);
    const previous = prior.get(key(kind, source._id));
    const sourceHash = sourceFingerprint(kind, source);
    const targetHash = targetFingerprint(collection, document);
    if (
      previous &&
      (previous.version !== 1 ||
        previous.sourceHash !== sourceHash ||
        previous.targetHash !== targetHash)
    ) {
      throw new Error(
        'Source, import options, or reserved mapping changed since the first apply. Reconcile before rerunning.',
      );
    }
    const existing = targetById.get(collection)?.get(document._id);
    if (
      existing &&
      (!previous ||
        targetFingerprint(collection, existing) !== previous.targetHash)
    ) {
      throw new Error(
        'Destination ID is unowned or its content was edited; refusing to overwrite it.',
      );
    }
    const mapping: Mapping = {
      _id: key(kind, source._id),
      version: 1,
      sourceDb: snapshot.sourceDb,
      clientPortalId,
      kind,
      sourceId: source._id,
      sourceHash,
      sourceDocument: source,
      targetCollection: collection,
      targetDocument: document,
      targetHash,
      ...urls,
    };
    if (BSON.calculateObjectSize(mapping) > 15 * 1024 * 1024)
      throw new Error(
        'Source plus target exceeds the mapping document size limit.',
      );
    plan.mappings.push(previous || mapping);
  };

  // Reserve pending mappings too: an interrupted batch may own a slug/count
  // before its CMS document exists, including a different source tenant's run.
  const occupiedCache = new Map<TargetCollection, RecordDocument[]>();
  const occupied = (collection: TargetCollection): RecordDocument[] => {
    const cached = occupiedCache.get(collection);
    if (cached) return cached;
    const records = [
      ...snapshot.target[collection],
      ...snapshot.mappings
        .filter((mapping) => mapping.targetCollection === collection)
        .map((mapping) => mapping.targetDocument),
    ];
    occupiedCache.set(collection, records);
    return records;
  };
  const slugOwners = new Map<TargetCollection, Map<string, string>>();
  for (const collection of ['cms_categories', 'cms_posts'] as const) {
    const owners = new Map<string, string>();
    for (const document of occupied(collection)) {
      const slug = text(document.slug);
      if (slug) owners.set(slug, document._id);
    }
    slugOwners.set(collection, owners);
  }
  const slugFor = (
    kind: EntityKind,
    source: RecordDocument,
    collection: TargetCollection,
  ): string => {
    const owners = slugOwners.get(collection);
    if (!owners) throw new Error('Unsupported slug collection.');
    const id = targetId(kind, source._id);
    const saved = text(prior.get(key(kind, source._id))?.targetDocument.slug);
    if (saved) {
      if (owners.has(saved) && owners.get(saved) !== id)
        throw new Error('Reserved slug is now used by another record.');
      owners.set(saved, id);
      return saved;
    }
    const base = createCmsSlug(
      text(source.code) || text(source.title) || source._id,
    );
    let slug = base;
    let suffix = 2;
    while (owners.has(slug) && owners.get(slug) !== id)
      slug = `${base}_${suffix++}`;
    owners.set(slug, id);
    return slug;
  };

  const topics = snapshot.topics.filter(
    (topic) => !options.topicIds.length || options.topicIds.includes(topic._id),
  );
  const topicMap = new Map(topics.map((topic) => [topic._id, topic]));
  for (const id of options.topicIds)
    if (!topicMap.has(id))
      plan.errors.push(`Topic ${id} does not exist in the source tenant.`);
  if (!topics.length) plan.errors.push('No source topics selected.');
  const categories = snapshot.categories.filter(
    (category) =>
      !options.topicIds.length || topicMap.has(text(category.topicId)),
  );
  const categoryMap = new Map(
    categories.map((category) => [category._id, category]),
  );
  const articles = snapshot.articles.filter(
    (article) =>
      !options.topicIds.length ||
      topicMap.has(text(article.topicId)) ||
      categoryMap.has(text(article.categoryId)),
  );
  const articleById = new Map(
    articles.map((article) => [article._id, article]),
  );
  const topicMembership = new Map(
    topics.map((topic) => [topic._id, new Set(ids(topic.categoryIds))]),
  );
  const categoryMembership = new Map(
    categories.map((category) => [
      category._id,
      new Set(ids(category.articleIds)),
    ]),
  );
  const depths = new Map<string, number>();
  plan.counts = {
    topics: topics.length,
    categories: categories.length,
    articles: articles.length,
    translations: 0,
  };
  const language = text(snapshot.cms.language);
  const validateArray = (value: unknown, label: string): void => {
    if (
      value !== undefined &&
      (!Array.isArray(value) ||
        value.some((entry) => typeof entry !== 'string' || !entry.trim()))
    )
      plan.errors.push(`${label}: expected an array of nonempty string IDs.`);
  };
  const validateReference = (value: unknown, label: string): void => {
    if (value !== undefined && value !== null && typeof value !== 'string')
      plan.errors.push(
        `${label}: expected a string ID or an absent reference.`,
      );
  };
  if (!language)
    plan.errors.push('Target CMS must have an explicit default language.');
  for (const topic of topics) {
    validateArray(topic.categoryIds, `Topic ${topic._id}.categoryIds`);
    const topicLanguage = text(topic.languageCode);
    if (topicLanguage && topicLanguage !== language)
      plan.errors.push(
        `Topic ${topic._id}: language ${topicLanguage} differs from target CMS ${language}; use a matching CMS destination.`,
      );
    if (!topicLanguage)
      plan.warnings.push(
        `Topic ${topic._id}: no source language; using target CMS default ${language}.`,
      );
    if (
      topic.scopeBrandIds !== undefined &&
      (!Array.isArray(topic.scopeBrandIds) || topic.scopeBrandIds.length > 0)
    )
      plan.errors.push(
        `Topic ${topic._id}: brand-scoped access has no equivalent in CMS categories.`,
      );
    if (
      ids(topic.categoryIds).some(
        (id) => categoryMap.get(id)?.topicId !== topic._id,
      )
    )
      plan.errors.push(
        `Topic ${topic._id}: categoryIds contains missing or differently owned categories.`,
      );
  }
  for (const category of categories) {
    validateArray(category.articleIds, `Category ${category._id}.articleIds`);
    validateReference(
      category.parentCategoryId,
      `Category ${category._id}.parentCategoryId`,
    );
    const topicId = text(category.topicId);
    if (!topicMap.has(topicId))
      plan.errors.push(
        `Category ${category._id}: missing topic ${topicId || '(empty)'}.`,
      );
    const visited = new Set<string>([category._id]);
    let parent = text(category.parentCategoryId);
    while (parent) {
      if (visited.size > 100) {
        plan.errors.push(
          `Category ${category._id}: hierarchy exceeds 100 levels.`,
        );
        break;
      }
      const ancestor = categoryMap.get(parent);
      if (!ancestor || ancestor.topicId !== topicId) {
        plan.errors.push(
          `Category ${category._id}: missing or cross-topic parent ${parent}.`,
        );
        break;
      }
      if (visited.has(parent)) {
        plan.errors.push(
          `Category ${category._id}: category hierarchy contains a cycle.`,
        );
        break;
      }
      visited.add(parent);
      parent = text(ancestor.parentCategoryId);
    }
    depths.set(category._id, visited.size);
    if (
      ids(category.articleIds).some(
        (id) => articleById.get(id)?.categoryId !== category._id,
      )
    ) {
      plan.errors.push(
        `Category ${category._id}: articleIds contains missing or differently owned articles.`,
      );
    }
  }
  for (const article of articles) {
    validateReference(article.topicId, `Article ${article._id}.topicId`);
    validateArray(
      article.reactionChoices,
      `Article ${article._id}.reactionChoices`,
    );
    const category = categoryMap.get(text(article.categoryId));
    if (!category)
      plan.errors.push(
        `Article ${article._id}: missing category ${
          text(article.categoryId) || '(empty)'
        }.`,
      );
    if (category && article.topicId && article.topicId !== category.topicId)
      plan.errors.push(
        `Article ${article._id}: topic conflicts with category ownership.`,
      );
    if (
      (article.isPrivate !== undefined && article.isPrivate !== false) ||
      article.status !== 'publish'
    ) {
      plan.errors.push(
        `Article ${article._id}: only explicitly published, non-private KB content is safe for the current CMS portal reads. Private/draft/scheduled/archived content requires a separate CMS access change.`,
      );
    }
  }
  if (plan.errors.length) return plan;

  const incompleteTopics = new Set(
    categories
      .filter(
        (category) =>
          !topicMembership.get(text(category.topicId))?.has(category._id),
      )
      .map((category) => text(category.topicId)),
  );
  const incompleteCategories = new Set(
    articles
      .filter(
        (article) =>
          !categoryMembership.get(text(article.categoryId))?.has(article._id),
      )
      .map((article) => text(article.categoryId)),
  );
  for (const topic of topics)
    if (incompleteTopics.has(topic._id)) {
      plan.warnings.push(
        `Topic ${topic._id}: rebuilt membership from category.topicId; categoryIds is incomplete.`,
      );
    }
  for (const category of categories)
    if (incompleteCategories.has(category._id)) {
      plan.warnings.push(
        `Category ${category._id}: rebuilt membership from article.categoryId; articleIds is incomplete.`,
      );
    }
  if (topics.length)
    plan.warnings.push(
      'Topic appearance, brand/form/notification references, category icons, ordering arrays and publisher/editor metadata are preserved in migration mappings; CMS does not execute these KB behaviors.',
    );

  const previousType = prior.get(key('postType', 'knowledgebase'));
  const existingTypes = snapshot.target.cms_custom_post_types.filter(
    (type) =>
      type.clientPortalId === clientPortalId && type.code === 'knowledgebase',
  );
  const postTypeId =
    previousType?.targetDocument._id ||
    existingTypes[0]?._id ||
    targetId('postType', 'knowledgebase');
  attempt('Knowledge Base post type', () => {
    if (existingTypes.length > 1)
      throw new Error('Multiple knowledgebase post types exist.');
    if (!previousType && existingTypes.length) {
      if (existingTypes[0].isActive !== true)
        throw new Error('Existing knowledgebase post type is inactive.');
      plan.reusedPostTypeId = postTypeId;
      return;
    }
    if (
      occupied('cms_custom_post_types').some(
        (type) =>
          type._id !== postTypeId &&
          type.clientPortalId === clientPortalId &&
          (type.code === 'knowledgebase' || type.name === 'knowledgebase'),
      )
    ) {
      throw new Error(
        'Existing post type conflicts with knowledgebase code/name.',
      );
    }
    const source: RecordDocument = { _id: 'knowledgebase' };
    add('postType', source, 'cms_custom_post_types', {
      _id: postTypeId,
      clientPortalId,
      code: 'knowledgebase',
      name: 'knowledgebase',
      label: 'Knowledge Base Article',
      pluralLabel: 'Knowledge Base Articles',
      isActive: true,
      ...timestamps('postType', source),
    });
  });
  for (const topic of topics)
    attempt(`Topic ${topic._id}`, () =>
      add('topic', topic, 'cms_categories', {
        _id: targetId('topic', topic._id),
        clientPortalId,
        name: requiredText(topic.title, 'title'),
        description: text(topic.description),
        slug: slugFor('topic', topic, 'cms_categories'),
        status: 'active',
        ...timestamps('topic', topic),
      }),
    );
  for (const category of [...categories].sort(
    (a, b) =>
      (depths.get(a._id) || 0) - (depths.get(b._id) || 0) ||
      a._id.localeCompare(b._id),
  ))
    attempt(`Category ${category._id}`, () =>
      add('category', category, 'cms_categories', {
        _id: targetId('category', category._id),
        clientPortalId,
        name: requiredText(category.title, 'title'),
        description: text(category.description),
        parentId: category.parentCategoryId
          ? targetId('category', text(category.parentCategoryId))
          : targetId('topic', text(category.topicId)),
        slug: slugFor('category', category, 'cms_categories'),
        status: 'active',
        ...timestamps('category', category),
      }),
    );

  const countOwners = new Map<number, string>();
  let nextCount = 0;
  for (const post of occupied('cms_posts')) {
    if (
      post.clientPortalId !== clientPortalId ||
      typeof post.count !== 'number'
    )
      continue;
    countOwners.set(post.count, post._id);
    nextCount = Math.max(nextCount, post.count + 1);
  }
  const articleTargets = new Map<string, RecordDocument>();
  const links = new Map<string, string>();
  for (const article of articles)
    attempt(`Article ${article._id}`, () => {
      const previous = prior.get(key('article', article._id));
      const postCount = previous
        ? count(previous.targetDocument.count)
        : nextCount++;
      count(postCount);
      if (
        countOwners.has(postCount) &&
        countOwners.get(postCount) !== targetId('article', article._id)
      )
        throw new Error('Reserved post count collides with another record.');
      countOwners.set(postCount, targetId('article', article._id));
      const target: RecordDocument = {
        _id: targetId('article', article._id),
        slug: slugFor('article', article, 'cms_posts'),
        count: postCount,
      };
      const urlField = text(snapshot.cms.postUrlField) || '_id';
      const publicUrl = text(snapshot.cms.publicUrl);
      const prefix = text(snapshot.cms.postUrlPrefix) || '/posts';
      if (
        publicUrl &&
        ['_id', 'slug', 'count'].includes(urlField) &&
        prefix.startsWith('/') &&
        !prefix.startsWith('//')
      ) {
        const base = new URL(publicUrl);
        if (
          !['https:', 'http:'].includes(base.protocol) ||
          base.username ||
          base.password
        )
          throw new Error(
            'CMS publicUrl must be an HTTP(S) URL without credentials.',
          );
        if (
          base.search ||
          base.hash ||
          prefix.includes('?') ||
          prefix.includes('#')
        )
          throw new Error(
            'CMS public URL and post prefix must not contain query strings or fragments.',
          );
        target.targetUrl = new URL(
          `${base.toString().replace(/\/$/, '')}${prefix.replace(
            /\/$/,
            '',
          )}/${encodeURIComponent(String(target[urlField]))}`,
        ).toString();
      }
      if (options.sourceArticleUrlTemplate) {
        target.sourceUrl = options.sourceArticleUrlTemplate.replaceAll(
          '{id}',
          encodeURIComponent(article._id),
        );
        if (!target.targetUrl)
          throw new Error(
            'Link rewriting requires CMS publicUrl, postUrlPrefix and a supported postUrlField.',
          );
        links.set(text(target.sourceUrl), text(target.targetUrl));
      }
      articleTargets.set(article._id, target);
    });
  const rewrite = (html: string): string => {
    if (
      snapshot.sourceDb !== snapshot.targetDb &&
      /\b(?:src|href)\s*=\s*["'](?!https?:|#|mailto:|tel:)/i.test(html)
    ) {
      throw new Error(
        'Cross-tenant HTML contains relative or unsupported media/link URLs. Resolve them to reachable absolute URLs before import.',
      );
    }
    return html.replace(
      /(\bhref\s*=\s*)(["'])(.*?)\2/gi,
      (match: string, lead: string, quote: string, href: string) => {
        const decoded = href.replace(/&amp;/g, '&');
        const [base, fragment] = decoded.split('#', 2);
        const destination = links.get(base);
        return destination
          ? `${lead}${quote}${destination
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')}${
              fragment === undefined ? '' : `#${fragment}`
            }${quote}`
          : match;
      },
    );
  };
  let mediaCount = 0;
  const mediaUrl = (value: unknown): string => {
    const url = requiredText(value, 'attachment.url');
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      if (parsed.username || parsed.password)
        throw new Error('Attachment URLs must not contain credentials.');
      return url;
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//'))
      throw new Error('Unsupported attachment URL scheme.');
    if (options.mediaBaseUrl)
      return new URL(url, options.mediaBaseUrl).toString();
    if (snapshot.sourceDb !== snapshot.targetDb)
      throw new Error(
        'Relative attachment URL requires KB_MEDIA_BASE_URL for cross-tenant imports.',
      );
    return url;
  };
  const attachment = (value: unknown): Record<string, unknown> => {
    if (!isRecord(value)) throw new Error('Invalid attachment object.');
    mediaCount++;
    const url = mediaUrl(value.url);
    const result: Record<string, unknown> = {
      name: requiredText(value.name, 'attachment.name'),
      type: requiredText(value.type, 'attachment.type'),
      url,
    };
    for (const field of ['size', 'duration'])
      if (value[field] !== undefined) {
        if (
          typeof value[field] !== 'number' ||
          !Number.isFinite(value[field]) ||
          value[field] < 0
        )
          throw new Error(`Invalid attachment.${field}.`);
        result[field] = value[field];
      }
    return result;
  };
  const reactions = new Set([
    'like',
    'love',
    'angry',
    'sad',
    'happy',
    'haha',
    'wow',
  ]);
  for (const article of articles)
    attempt(`Article ${article._id}`, () => {
      const target = articleTargets.get(article._id);
      if (!target) throw new Error('Could not allocate article destination.');
      const { sourceUrl, targetUrl, ...identity } = target;
      const authorSource = text(article.createdBy);
      const mappedAuthor = Object.prototype.hasOwnProperty.call(
        options.authorMap,
        authorSource,
      )
        ? options.authorMap[authorSource]
        : authorSource;
      const authorId = snapshot.userIds.has(mappedAuthor)
        ? mappedAuthor
        : options.fallbackAuthorId;
      if (!authorId || !snapshot.userIds.has(authorId))
        throw new Error(
          'Author is missing in target users; provide KB_AUTHOR_MAP or ADMIN_USER_ID.',
        );
      if (authorId !== authorSource)
        plan.warnings.push(
          `Article ${article._id}: author remapped; original author retained in metadata.`,
        );
      const categoryIds: string[] = [];
      let category = categoryMap.get(text(article.categoryId));
      const topicId = text(category?.topicId);
      while (category) {
        categoryIds.push(targetId('category', category._id));
        category = categoryMap.get(text(category.parentCategoryId));
      }
      categoryIds.push(targetId('topic', topicId));
      const reactionCounts: Record<string, number> = {};
      if (
        article.reactionCounts !== undefined &&
        !isRecord(article.reactionCounts)
      )
        throw new Error('Invalid reactionCounts.');
      for (const [reaction, value] of Object.entries(
        isRecord(article.reactionCounts) ? article.reactionCounts : {},
      )) {
        if (reactions.has(reaction)) reactionCounts[reaction] = count(value);
        else
          plan.warnings.push(
            `Article ${article._id}: unsupported reaction count retained only in metadata.`,
          );
      }
      const choices = ids(article.reactionChoices);
      if (choices.some((choice) => !reactions.has(choice)))
        plan.warnings.push(
          `Article ${article._id}: unsupported reaction choices retained only in metadata.`,
        );
      if (
        article.attachments !== undefined &&
        !Array.isArray(article.attachments)
      )
        throw new Error('Invalid attachments array.');
      const content = requiredText(article.content, 'content');
      let pdfAttachment: Record<string, unknown> | undefined;
      if (
        article.pdfAttachment !== undefined &&
        article.pdfAttachment !== null
      ) {
        if (
          !isRecord(article.pdfAttachment) ||
          !Array.isArray(article.pdfAttachment.pages)
        )
          throw new Error(
            'Invalid pdfAttachment; expected pdf and pages attachment records.',
          );
        pdfAttachment = {
          ...(article.pdfAttachment.pdf
            ? { pdf: attachment(article.pdfAttachment.pdf) }
            : {}),
          pages: article.pdfAttachment.pages.map(attachment),
        };
      }
      const post: RecordDocument = {
        ...identity,
        _id: identity._id,
        clientPortalId,
        type: postTypeId,
        title: requiredText(article.title, 'title'),
        content: rewrite(content),
        excerpt: text(article.summary),
        categoryIds,
        status: 'published',
        authorId,
        authorKind: 'user',
        publishedDate: date(article.publishedAt),
        scheduledDate: date(article.scheduledDate),
        ...timestamps('article', article),
        viewCount: count(article.viewCount),
        reactions: choices.filter((choice) => reactions.has(choice)),
        reactionCounts,
        thumbnail: article.image ? attachment(article.image) : undefined,
        attachments: Array.isArray(article.attachments)
          ? article.attachments.map(attachment)
          : [],
        pdfAttachment,
        tagIds: [],
        featured: false,
      };
      add('article', article, 'cms_posts', post, {
        ...(typeof sourceUrl === 'string' ? { sourceUrl } : {}),
        ...(typeof targetUrl === 'string' ? { targetUrl } : {}),
      });
    });
  if (mediaCount)
    plan.warnings.push(
      `${mediaCount} attachment references preserved. No file transfer or network availability check is performed; retain source storage and verify links before cutover.`,
    );
  if (!options.sourceArticleUrlTemplate)
    plan.warnings.push(
      'KB_ARTICLE_URL_TEMPLATE is unset; article links are preserved and no automatic redirects are installed.',
    );

  const kinds: Record<string, EntityKind> = {
    knowledgeBaseTopic: 'topic',
    knowledgeBaseCategory: 'category',
    knowledgeBaseArticle: 'article',
  };
  const seenTranslations = new Set<string>();
  const migratedBySource = new Map(
    plan.mappings.map((mapping) => [
      key(mapping.kind, mapping.sourceId),
      mapping,
    ]),
  );
  const translationOwners = new Map(
    occupied('cms_translations').map((row) => [
      JSON.stringify([row.objectId, row.type, row.language]),
      row._id,
    ]),
  );
  for (const translation of snapshot.translations) {
    const kind = kinds[text(translation.type)];
    if (!kind) continue;
    const objectId = text(translation.objectId);
    const base = migratedBySource.get(key(kind, objectId));
    if (!base) {
      if (!options.topicIds.length)
        plan.errors.push(
          `Translation ${translation._id}: base ${objectId} was not migrated.`,
        );
      continue;
    }
    attempt(`Translation ${translation._id}`, () => {
      const translationLanguage = requiredText(
        translation.language,
        'language',
      );
      if (translationLanguage === language)
        throw new Error(
          'Default-language translation conflicts with base content; reconcile it before import.',
        );
      if (!ids(snapshot.cms.languages).includes(translationLanguage))
        throw new Error('Translation language is not enabled in target CMS.');
      if (
        translation.customFieldsData !== undefined &&
        (!Array.isArray(translation.customFieldsData) ||
          translation.customFieldsData.length)
      )
        throw new Error(
          'Translation custom field IDs require an explicit field mapping.',
        );
      const type = kind === 'article' ? 'post' : 'category';
      const identity = JSON.stringify([
        base.targetDocument._id,
        type,
        translationLanguage,
      ]);
      if (seenTranslations.has(identity))
        throw new Error('Duplicate translation identity.');
      seenTranslations.add(identity);
      const id = targetId('translation', translation._id);
      if (
        translationOwners.has(identity) &&
        translationOwners.get(identity) !== id
      )
        throw new Error('Translation identity already exists.');
      add('translation', translation, 'cms_translations', {
        _id: id,
        objectId: base.targetDocument._id,
        type,
        language: translationLanguage,
        title: text(translation.title),
        content: rewrite(text(translation.content)),
        excerpt: text(translation.excerpt),
      });
      plan.counts.translations++;
    });
  }
  return plan;
};
