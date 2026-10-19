import { useQuery } from '@apollo/client';
import { IRelation } from 'erxes-ui';
import { useMemo } from 'react';
import { GET_RELATIONS_BY_CONTENT_IDS } from '../graphql/getRelations';
import {
  COMPANY_CONTENT_TYPE,
  CUSTOMER_CONTENT_TYPE,
  getWidgetContacts,
  TRelationEntity,
} from '../utils';

export interface IContactRelatedEntity extends TRelationEntity {
  // The host's contacts this record is linked to.
  via: TRelationEntity[];
}

type TContentIdsData = { getRelationsByContentIds: IRelation[] };

const toKey = ({ contentType, contentId }: TRelationEntity) =>
  `${contentType}:${contentId}`;

const useRelationsOfContacts = (
  contentType: string,
  contentIds: string[],
  relatedContentType: string,
  skip?: boolean,
) =>
  useQuery<TContentIdsData>(GET_RELATIONS_BY_CONTENT_IDS, {
    variables: { contentType, contentIds, relatedContentType },
    skip: skip || !contentIds.length,
  });

/**
 * Records of `relatedContentType` that reach the host only through its
 * contacts: a task's view of the deals its customer has. Records already
 * linked to the host (`excludeIds`) and the host itself are left out.
 */
export const useContactRelations = ({
  contentType,
  contentId,
  relatedContentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
  excludeIds,
  skip,
}: {
  contentType: string;
  contentId: string;
  relatedContentType: string;
  customerId?: string;
  companyId?: string;
  customerIds?: string[];
  companyIds?: string[];
  excludeIds?: string[];
  skip?: boolean;
}) => {
  const contacts = getWidgetContacts({
    customerId,
    companyId,
    customerIds,
    companyIds,
  });

  // The host's own links are fetched by the widget already.
  const withoutHost = (type: string, ids: string[]) =>
    type === contentType ? ids.filter((id) => id !== contentId) : ids;

  const viaCustomers = withoutHost(CUSTOMER_CONTENT_TYPE, contacts.customerIds);
  const viaCompanies = withoutHost(COMPANY_CONTENT_TYPE, contacts.companyIds);

  const customers = useRelationsOfContacts(
    CUSTOMER_CONTENT_TYPE,
    viaCustomers,
    relatedContentType,
    skip,
  );
  const companies = useRelationsOfContacts(
    COMPANY_CONTENT_TYPE,
    viaCompanies,
    relatedContentType,
    skip,
  );

  const customerRelations = customers.data?.getRelationsByContentIds;
  const companyRelations = companies.data?.getRelationsByContentIds;

  // Callers pass fresh arrays each render; memoize on their contents.
  const contactsKey = [
    ...viaCustomers.map((id) => `${CUSTOMER_CONTENT_TYPE}:${id}`),
    ...viaCompanies.map((id) => `${COMPANY_CONTENT_TYPE}:${id}`),
  ].join(',');
  const excludedKey = [
    `${contentType}:${contentId}`,
    ...(excludeIds || []).map((id) => `${relatedContentType}:${id}`),
  ].join(',');

  const entities = useMemo(() => {
    const contactKeys = new Set(contactsKey.split(','));
    const excludedKeys = new Set(excludedKey.split(','));
    const byId = new Map<string, IContactRelatedEntity>();

    for (const relation of [
      ...(customerRelations || []),
      ...(companyRelations || []),
    ]) {
      const contact = relation.entities.find((entity) =>
        contactKeys.has(toKey(entity)),
      );
      const related = relation.entities.find(
        (entity) =>
          entity !== contact && entity.contentType === relatedContentType,
      );

      if (
        !contact ||
        !related ||
        excludedKeys.has(toKey(related)) ||
        contactKeys.has(toKey(related))
      ) {
        continue;
      }

      const existing = byId.get(related.contentId);

      if (existing) {
        existing.via.push(contact);
      } else {
        byId.set(related.contentId, { ...related, via: [contact] });
      }
    }

    return [...byId.values()];
  }, [
    customerRelations,
    companyRelations,
    relatedContentType,
    contactsKey,
    excludedKey,
  ]);

  const relatedIds = useMemo(
    () => entities.map((entity) => entity.contentId),
    [entities],
  );

  return {
    entities,
    relatedIds,
    loading: customers.loading || companies.loading,
  };
};
