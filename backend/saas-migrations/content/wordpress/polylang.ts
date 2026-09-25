import { WordPressExport, WordPressItem, WordPressTerm } from './types';

export interface WordPressLanguageItem<T> {
  language: string;
  value: T;
}

export interface WordPressLanguageGroup<T> {
  key: string;
  base: WordPressLanguageItem<T>;
  entries: WordPressLanguageItem<T>[];
}

export interface WordPressPolylangPlan {
  defaultLanguage: string;
  languages: string[];
  itemGroups: WordPressLanguageGroup<WordPressItem>[];
  termGroups: WordPressLanguageGroup<WordPressTerm>[];
  warnings: string[];
}

const taxonomySlug = (item: WordPressItem, taxonomy: string): string =>
  item.taxonomies.find((reference) => reference.taxonomy === taxonomy)?.slug ||
  '';

const resolveDefaultLanguage = (
  siteLanguage: string,
  languages: string[],
): string => {
  const normalizedSiteLanguage = siteLanguage.trim().toLowerCase();
  const exact = languages.find(
    (language) => language.toLowerCase() === normalizedSiteLanguage,
  );

  if (exact) {
    return exact;
  }

  const languagePrefix = normalizedSiteLanguage.split(/[-_]/)[0];
  const prefixMatch = languages.find(
    (language) => language.toLowerCase() === languagePrefix,
  );

  return prefixMatch || languages[0] || siteLanguage || 'en';
};

const selectBase = <T>(
  entries: WordPressLanguageItem<T>[],
  defaultLanguage: string,
): WordPressLanguageItem<T> =>
  entries.find(({ language }) => language === defaultLanguage) || entries[0];

const groupItems = (
  items: WordPressItem[],
  defaultLanguage: string,
): WordPressLanguageGroup<WordPressItem>[] => {
  const grouped = new Map<string, WordPressLanguageItem<WordPressItem>[]>();

  for (const item of items) {
    const language = taxonomySlug(item, 'language') || defaultLanguage;
    const polylangGroup = taxonomySlug(item, 'post_translations');
    const key = polylangGroup
      ? `${item.postType}:${polylangGroup}`
      : `${item.postType}:single:${item.id}`;
    grouped.set(key, [...(grouped.get(key) || []), { language, value: item }]);
  }

  return [...grouped].map(([key, entries]) => ({
    key,
    base: selectBase(entries, defaultLanguage),
    entries,
  }));
};

const parseSerializedTermLanguages = (
  description: string,
): { language: string; termId: string }[] =>
  [...description.matchAll(/s:\d+:"([^"]+)";i:(\d+);/g)].map((match) => ({
    language: match[1],
    termId: match[2],
  }));

interface TermTranslationEntry {
  language: string;
  termId: string;
}

interface TermTranslationRecord {
  term: WordPressTerm;
  entries: TermTranslationEntry[];
}

const termIdentity = (term: WordPressTerm): string =>
  term.id ? `id:${term.id}` : `slug:${term.slug}`;

const relevantTranslationRecords = (
  taxonomy: string,
  termsById: Map<string, WordPressTerm>,
  translationRecords: TermTranslationRecord[],
): TermTranslationRecord[] =>
  translationRecords
    .map(({ term, entries }) => ({
      term,
      entries: entries.filter(
        ({ termId }) => termsById.get(termId)?.taxonomy === taxonomy,
      ),
    }))
    .filter(({ entries }) => entries.length > 0);

const createTermComponents = (
  taxonomyTerms: WordPressTerm[],
  translationRecords: TermTranslationRecord[],
): WordPressTerm[][] => {
  const parentById = new Map(
    taxonomyTerms.map((term) => {
      const identity = termIdentity(term);
      return [identity, identity] as const;
    }),
  );
  const findRoot = (termId: string): string => {
    const parent = parentById.get(termId) || termId;

    if (parent === termId) {
      return termId;
    }

    const root = findRoot(parent);
    parentById.set(termId, root);
    return root;
  };
  const union = (leftId: string, rightId: string): void => {
    const leftRoot = findRoot(leftId);
    const rightRoot = findRoot(rightId);

    if (leftRoot !== rightRoot) {
      parentById.set(rightRoot, leftRoot);
    }
  };

  for (const { entries } of translationRecords) {
    const [firstEntry, ...remainingEntries] = entries;

    for (const entry of remainingEntries) {
      union(`id:${firstEntry.termId}`, `id:${entry.termId}`);
    }
  }

  const components = new Map<string, WordPressTerm[]>();

  for (const term of taxonomyTerms) {
    const root = findRoot(termIdentity(term));
    components.set(root, [...(components.get(root) || []), term]);
  }

  return [...components.values()];
};

const componentTranslationRecords = (
  componentTerms: WordPressTerm[],
  translationRecords: TermTranslationRecord[],
): TermTranslationRecord[] => {
  const componentIds = new Set(
    componentTerms.map(({ id }) => id).filter(Boolean),
  );

  return translationRecords
    .map(({ term, entries }) => ({
      term,
      entries: entries.filter(({ termId }) => componentIds.has(termId)),
    }))
    .filter(({ entries }) => entries.length > 0)
    .sort((left, right) => right.entries.length - left.entries.length);
};

const buildLanguageByTermId = (
  records: TermTranslationRecord[],
  warnings: string[],
): Map<string, string> => {
  const languageDetails = new Map<
    string,
    { language: string; recordSize: number }
  >();

  for (const { entries } of records) {
    for (const { language, termId } of entries) {
      const existing = languageDetails.get(termId);

      if (existing && existing.language !== language) {
        warnings.push(
          `Polylang term ${termId} has conflicting languages ${existing.language} and ${language}; the richer translation group was used.`,
        );
      }

      if (!existing || entries.length > existing.recordSize) {
        languageDetails.set(termId, {
          language,
          recordSize: entries.length,
        });
      }
    }
  }

  return new Map(
    [...languageDetails].map(([termId, { language }]) => [termId, language]),
  );
};

const buildTermLanguageGroup = (
  taxonomy: string,
  componentTerms: WordPressTerm[],
  translationRecords: TermTranslationRecord[],
  defaultLanguage: string,
  warnings: string[],
): WordPressLanguageGroup<WordPressTerm> => {
  const records = componentTranslationRecords(
    componentTerms,
    translationRecords,
  );
  const languageByTermId = buildLanguageByTermId(records, warnings);
  const entries = componentTerms.map((term) => ({
    language: languageByTermId.get(term.id) || defaultLanguage,
    value: term,
  }));
  const groupKey =
    records[0]?.term.slug ||
    `single:${componentTerms[0].id || componentTerms[0].slug}`;

  return {
    key: `${taxonomy}:${groupKey}`,
    base: selectBase(entries, defaultLanguage),
    entries,
  };
};

const groupTaxonomyTerms = (
  taxonomy: string,
  contentTerms: WordPressTerm[],
  termsById: Map<string, WordPressTerm>,
  translationRecords: TermTranslationRecord[],
  defaultLanguage: string,
  warnings: string[],
): WordPressLanguageGroup<WordPressTerm>[] => {
  const taxonomyTerms = contentTerms.filter(
    (term) => term.taxonomy === taxonomy,
  );
  const relevantRecords = relevantTranslationRecords(
    taxonomy,
    termsById,
    translationRecords,
  );
  const components = createTermComponents(taxonomyTerms, relevantRecords);

  return components.map((componentTerms) =>
    buildTermLanguageGroup(
      taxonomy,
      componentTerms,
      relevantRecords,
      defaultLanguage,
      warnings,
    ),
  );
};

const groupTerms = (
  terms: WordPressTerm[],
  defaultLanguage: string,
): {
  groups: WordPressLanguageGroup<WordPressTerm>[];
  warnings: string[];
} => {
  const contentTerms = terms.filter(({ taxonomy }) =>
    ['category', 'post_tag'].includes(taxonomy),
  );
  const termsById = new Map(
    contentTerms.filter(({ id }) => id).map((term) => [term.id, term]),
  );
  const warnings: string[] = [];
  const translationRecords = terms
    .filter(({ taxonomy }) => taxonomy === 'term_translations')
    .map((term) => ({
      term,
      entries: parseSerializedTermLanguages(term.description).filter(
        ({ termId }) => termsById.has(termId),
      ),
    }));
  const groups = ['category', 'post_tag'].flatMap((taxonomy) =>
    groupTaxonomyTerms(
      taxonomy,
      contentTerms,
      termsById,
      translationRecords,
      defaultLanguage,
      warnings,
    ),
  );

  return { groups, warnings };
};

export const buildWordPressPolylangPlan = (
  wxr: WordPressExport,
  items: WordPressItem[],
  terms: WordPressTerm[],
): WordPressPolylangPlan => {
  const discoveredLanguages = [
    ...new Set(
      [
        ...wxr.terms
          .filter(({ taxonomy }) => taxonomy === 'language')
          .map(({ slug }) => slug),
        ...items.map((item) => taxonomySlug(item, 'language')),
      ].filter(Boolean),
    ),
  ];
  const defaultLanguage = resolveDefaultLanguage(
    wxr.site.language,
    discoveredLanguages,
  );
  const languages = [
    defaultLanguage,
    ...discoveredLanguages.filter((language) => language !== defaultLanguage),
  ];
  const itemGroups = groupItems(items, defaultLanguage);
  const termPlan = groupTerms(terms, defaultLanguage);
  const termGroups = termPlan.groups;
  const warnings = [...termPlan.warnings];

  for (const group of [...itemGroups, ...termGroups]) {
    const duplicateLanguages = group.entries
      .map(({ language }) => language)
      .filter((language, index, values) => values.indexOf(language) !== index);

    if (duplicateLanguages.length > 0) {
      warnings.push(
        `Polylang group ${group.key} contains duplicate language entries: ${[
          ...new Set(duplicateLanguages),
        ].join(', ')}.`,
      );
    }
  }

  return {
    defaultLanguage,
    languages,
    itemGroups,
    termGroups,
    warnings,
  };
};
