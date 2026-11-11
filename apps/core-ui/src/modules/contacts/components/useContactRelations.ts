import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import type { TContactContentType } from '../utils/contactDetailPath';

/** Customers ↔ companies links of one contact, read and replaced as a list of ids. */
export const useContactRelations = (contentType: TContactContentType, contentId: string) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const isCustomer = contentType === 'core:customer';

  const queryKey = isCustomer
    ? ['customers', 'companies', contentId]
    : ['customers', 'ofCompany', contentId];

  const query = useQuery({
    queryKey,
    queryFn: async () =>
      isCustomer
        ? (await api.customers.companies({ id: contentId })).data.map((company) => company.id)
        : (await api.customers.list({ companyId: contentId, limit: 100 })).data.map(
            (customer) => customer.id,
          ),
    enabled: !!contentId,
  });

  const relatedIds = query.data ?? [];

  const link = (otherId: string, linked: boolean) => {
    const pair = isCustomer
      ? { id: contentId, companyId: otherId }
      : { id: otherId, companyId: contentId };

    return linked ? api.customers.linkCompany(pair) : api.customers.unlinkCompany(pair);
  };

  const save = useMutation({
    mutationFn: async (nextIds: string[]) => {
      await Promise.all([
        ...nextIds.filter((id) => !relatedIds.includes(id)).map((id) => link(id, true)),
        ...relatedIds.filter((id) => !nextIds.includes(id)).map((id) => link(id, false)),
      ]);
    },
    onMutate: (nextIds) => client.setQueryData(queryKey, nextIds),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ['customers'] });
      void client.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: 'Could not update links',
        description: messageOf(error),
      }),
  });

  return {
    relatedIds,
    loading: query.isPending,
    error: query.error,
    refetch: query.refetch,
    saving: save.isPending,
    setRelatedIds: (ids: string[]) => save.mutateAsync(ids),
  };
};

/** Links a contact just created to the records picked in its draft. */
export const linkNewContact = (
  contentType: TContactContentType,
  contentId: string,
  relatedIds: string[],
) =>
  Promise.all(
    relatedIds.map((otherId) =>
      api.customers.linkCompany(
        contentType === 'core:customer'
          ? { id: contentId, companyId: otherId }
          : { id: otherId, companyId: contentId },
      ),
    ),
  );
