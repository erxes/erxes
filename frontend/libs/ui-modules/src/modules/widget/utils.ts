import { IRelation } from 'erxes-ui';
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

/**
 * The one customer and one company a relation widget lists records by: the
 * host itself when it is a contact, else the host's first of each. Records
 * keep their own `customerId` / `companyId`, so a widget lists the records
 * sharing them and a record created there starts with them.
 */
export const getHostContacts = ({
  contentType,
  contentId,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: {
  contentType: string;
  contentId: string;
  customerId?: string;
  companyId?: string;
  customerIds?: string[];
  companyIds?: string[];
}): { customerId?: string; companyId?: string } => {
  if (contentType === CUSTOMER_CONTENT_TYPE) {
    return { customerId: contentId };
  }

  if (contentType === COMPANY_CONTENT_TYPE) {
    return { companyId: contentId };
  }

  const contacts = getWidgetContacts({
    customerId,
    companyId,
    customerIds,
    companyIds,
  });

  return {
    customerId: contacts.customerIds[0],
    companyId: contacts.companyIds[0],
  };
};
