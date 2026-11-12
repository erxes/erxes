import type { ContactLink } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { messageOf, orpc } from '~/lib/api';

export type ContactSide = 'core:customer' | 'core:company';

export interface LinkRow {
  /** The other side's id. */
  id: string;
  name: string;
  avatarUrl: string | null;
  link: ContactLink;
}

/** The customer–company pair for linking `id` (on `side`) with `otherId`. */
const pairOf = (side: ContactSide, id: string, otherId: string) =>
  side === 'core:customer' ? { id, companyId: otherId } : { id: otherId, companyId: id };

/** Links a contact just created to the records picked in its draft. */
export const linkNewContact = (side: ContactSide, id: string, otherIds: string[]) =>
  Promise.all(
    otherIds.map((otherId) => orpc.customers.linkCompany.call(pairOf(side, id, otherId))),
  );

/** A person's companies or a company's people, as rows. */
const useLinkRows = (side: ContactSide, id: string) => {
  const companies = useQuery(
    orpc.customers.companies.queryOptions({
      input: { id },
      enabled: side === 'core:customer' && Boolean(id),
      select: (page): LinkRow[] =>
        page.data.map((company) => ({
          id: company.id,
          name: company.primaryName,
          avatarUrl: company.avatarUrl,
          link: company.link,
        })),
    }),
  );
  const people = useQuery(
    orpc.companies.people.queryOptions({
      input: { id },
      enabled: side === 'core:company' && Boolean(id),
      select: (page): LinkRow[] =>
        page.data.map((person) => ({
          id: person.id,
          name:
            [person.firstName, person.lastName].filter(Boolean).join(' ') ||
            person.primaryEmail ||
            person.primaryPhone ||
            'Unnamed',
          avatarUrl: person.avatarUrl,
          link: person.link,
        })),
    }),
  );

  return side === 'core:customer' ? companies : people;
};

/** A contact's links to the other kind: a person's companies or a company's people, current first. */
export const useContactLinks = (side: ContactSide, id: string) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const query = useLinkRows(side, id);
  const handlers = {
    onSettled: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: orpc.customers.key() }),
        client.invalidateQueries({ queryKey: orpc.companies.key() }),
      ]),
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: 'Could not update the link',
        description: messageOf(error),
      }),
  };
  const link = useMutation(orpc.customers.linkCompany.mutationOptions(handlers));
  const unlink = useMutation(orpc.customers.unlinkCompany.mutationOptions(handlers));

  return {
    query,
    set: (
      otherId: string,
      input: { role?: string | null; isPrimaryContact?: boolean; ended?: boolean } = {},
    ) => link.mutate({ ...pairOf(side, id, otherId), ...input }),
    remove: (otherId: string) => unlink.mutate(pairOf(side, id, otherId)),
  };
};
