import { IRelation, IRelationInput } from 'erxes-ui';
import { WidgetAccessProp } from './widget-provider/context/widgetContext';

export type TRelationEntity = IRelation['entities'][number];

export const getRelationWidgetLabel = (module: {
  name: string;
  label?: string;
}): string =>
  module.label || module.name.charAt(0).toUpperCase() + module.name.slice(1);

export const resolveAccess = (
  access: WidgetAccessProp,
  moduleName: string,
): 'read' | 'write' => {
  if (typeof access === 'string') return access;

  return access[moduleName] ?? 'write';
};

const entityKey = ({ contentType, contentId }: TRelationEntity) =>
  `${contentType}:${contentId}`;

/**
 * The far ends of `relations` as seen from `self`, of `relatedContentType`
 * only, each once. A record related to its own type (deal ↔ deal) still
 * counts, since the record itself is what gets skipped, not its type.
 */
export const getRelatedEntities = (
  relations: IRelation[] | undefined,
  self: TRelationEntity,
  relatedContentType?: string,
): TRelationEntity[] => {
  const selfKey = entityKey(self);
  const seen = new Set<string>();

  return (relations || []).flatMap((relation) =>
    relation.entities.filter((entity) => {
      const key = entityKey(entity);

      if (
        key === selfKey ||
        seen.has(key) ||
        (relatedContentType && entity.contentType !== relatedContentType)
      ) {
        return false;
      }

      seen.add(key);
      return true;
    }),
  );
};

/**
 * Links a newly made or picked record to the host and to the customer and
 * company the host is about, skipping any of those that are the same record.
 */
export const buildRelationInputs = ({
  related,
  sources,
}: {
  related: TRelationEntity;
  sources: (TRelationEntity | false | null | undefined)[];
}): IRelationInput[] => {
  const seen = new Set<string>([entityKey(related)]);

  return sources
    .filter((source): source is TRelationEntity => {
      if (!source || !source.contentId) {
        return false;
      }

      const key = entityKey(source);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((source) => ({ entities: [source, related] }));
};

export const CUSTOMER_CONTENT_TYPE = 'core:customer';
export const COMPANY_CONTENT_TYPE = 'core:company';

const uniqueIds = (...lists: (string[] | string | undefined)[]) => [
  ...new Set(lists.flat().filter((id): id is string => !!id)),
];

/**
 * The contacts a relation widget's host is about: the single ids a host may
 * pass (a conversation's customer) together with those it resolved.
 */
export const getWidgetContacts = ({
  customerId,
  companyId,
  customerIds,
  companyIds,
}: {
  customerId?: string;
  companyId?: string;
  customerIds?: string[];
  companyIds?: string[];
}) => ({
  customerIds: uniqueIds(customerId, customerIds),
  companyIds: uniqueIds(companyId, companyIds),
});
