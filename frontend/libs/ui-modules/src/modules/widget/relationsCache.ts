import { ApolloCache, gql, Reference } from '@apollo/client';
import { Modifier } from '@apollo/client/cache';
import { IRelation } from 'erxes-ui';
import { TRelationEntity } from './utils';

/**
 * Keeps the cached relation lists (`getRelationsByEntity`,
 * `getRelationsByContentIds`) in step with a relation change, so every
 * widget showing them — the host's own and the ones reached through its
 * contacts — updates without refetching.
 */

type TRelationListArgs = {
  contentType: string;
  contentId?: string;
  contentIds?: string[];
  relatedContentType: string;
};

const RELATION_LIST_FIELDS = [
  'getRelationsByEntity',
  'getRelationsByContentIds',
] as const;

const RELATION_FRAGMENT = gql`
  fragment RelationsCacheRelation on Relation {
    _id
    entities {
      contentType
      contentId
    }
  }
`;

// `getRelationsByEntity({"contentId":…,…})` → its arguments.
const parseArgs = (
  fieldName: string,
  storeFieldName: string,
): TRelationListArgs | undefined => {
  const raw = storeFieldName.slice(fieldName.length);
  const start = raw.indexOf('{');

  if (start === -1) {
    return undefined;
  }

  try {
    return JSON.parse(raw.slice(start, raw.lastIndexOf('}') + 1));
  } catch {
    return undefined;
  }
};

// Whether a relation belongs in the list these arguments ask for.
const isListedBy = (
  args: TRelationListArgs,
  entities: readonly TRelationEntity[],
) => {
  const hostIds = args.contentIds || (args.contentId ? [args.contentId] : []);
  const host = entities.find(
    (entity) =>
      entity.contentType === args.contentType &&
      hostIds.includes(entity.contentId),
  );

  return (
    !!host &&
    entities.some(
      (entity) =>
        entity !== host && entity.contentType === args.relatedContentType,
    )
  );
};

const sameEntity = (a: TRelationEntity, b: TRelationEntity) =>
  a.contentType === b.contentType && a.contentId === b.contentId;

const samePair = (
  a: readonly TRelationEntity[],
  b: readonly TRelationEntity[],
) =>
  a.length === b.length &&
  a.every((entity) => b.some((other) => sameEntity(entity, other)));

const modifyRelationLists = (
  cache: ApolloCache<unknown>,
  update: (
    list: readonly Reference[],
    args: TRelationListArgs,
    readEntities: (ref: Reference) => readonly TRelationEntity[],
  ) => readonly Reference[],
) => {
  const modifier =
    (fieldName: string): Modifier<Reference | readonly Reference[]> =>
    (list, { storeFieldName, readField }) => {
      const args = parseArgs(fieldName, storeFieldName);

      if (!Array.isArray(list) || !args) {
        return list;
      }

      return update(
        list,
        args,
        (ref) => readField<TRelationEntity[]>('entities', ref) || [],
      );
    };

  cache.modify<Record<string, readonly Reference[]>>({
    id: 'ROOT_QUERY',
    fields: Object.fromEntries(
      RELATION_LIST_FIELDS.map((fieldName) => [fieldName, modifier(fieldName)]),
    ),
  });
};

// Adds newly made relations to every cached list they belong in.
export const addRelationsToCache = (
  cache: ApolloCache<unknown>,
  relations: IRelation[],
) => {
  const written = relations.flatMap((relation) => {
    const entities = relation.entities.map(({ contentType, contentId }) => ({
      __typename: 'Entity',
      contentType,
      contentId,
    }));
    const ref = cache.writeFragment({
      fragment: RELATION_FRAGMENT,
      data: { __typename: 'Relation', _id: relation._id, entities },
    });

    return ref ? [{ ref, entities }] : [];
  });

  if (!written.length) {
    return;
  }

  modifyRelationLists(cache, (list, args, readEntities) => {
    const added = written.filter(
      ({ ref, entities }) =>
        isListedBy(args, entities) &&
        !list.some(
          (item) =>
            item.__ref === ref.__ref || samePair(readEntities(item), entities),
        ),
    );

    return added.length ? [...list, ...added.map(({ ref }) => ref)] : list;
  });
};

/**
 * After `manageRelations` set a host's links of one type to `kept`, drops the
 * host's other links of that type from every cached list.
 */
export const removeUnkeptRelationsFromCache = (
  cache: ApolloCache<unknown>,
  {
    contentType,
    contentId,
    relatedContentType,
    keptIds,
  }: {
    contentType: string;
    contentId: string;
    relatedContentType: string;
    keptIds: string[];
  },
) => {
  const isDropped = (entities: readonly TRelationEntity[]) => {
    const host = entities.find(
      (entity) =>
        entity.contentType === contentType && entity.contentId === contentId,
    );
    const related = entities.find(
      (entity) => entity !== host && entity.contentType === relatedContentType,
    );

    return !!host && !!related && !keptIds.includes(related.contentId);
  };

  modifyRelationLists(cache, (list, _args, readEntities) => {
    const kept = list.filter((item) => !isDropped(readEntities(item)));

    return kept.length === list.length ? list : kept;
  });
};
