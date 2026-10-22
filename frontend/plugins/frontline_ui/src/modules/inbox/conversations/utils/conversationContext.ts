import type {
  IConversationContextIntegration,
  IConversationCustomer,
  IConversationContextValue,
  IConversationDetail,
} from '@/inbox/types/Conversation';

type ConversationCustomer = {
  _id: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  primaryEmail?: string | null;
  emails?: (string | null)[] | null;
  primaryPhone?: string | null;
  avatar?: string | null;
};

/** Core customers can resolve without an `_id`; those cannot be shown inline. */
export const toCustomerInline = (
  customer?: ConversationCustomer | null,
): IConversationCustomer | undefined =>
  customer?._id
    ? {
        _id: customer._id,
        firstName: customer.firstName ?? undefined,
        middleName: customer.middleName ?? undefined,
        lastName: customer.lastName ?? undefined,
        primaryEmail: customer.primaryEmail ?? undefined,
        emails: customer.emails?.filter((email): email is string => !!email),
        primaryPhone: customer.primaryPhone ?? undefined,
        avatar: customer.avatar ?? undefined,
      }
    : undefined;

/** Merges the selected list row with the loaded detail; the integration comes only from `IntegrationInline`. */
export const toConversationContextValue = ({
  _id,
  conversation,
  detail,
  integration,
  loading,
}: {
  _id: string;
  conversation?: Partial<IConversationContextValue> | null;
  detail?: IConversationDetail;
  integration?: IConversationContextIntegration | null;
  loading?: boolean;
}): IConversationContextValue & {
  tagIds?: (string | null)[] | null;
} => ({
  ...conversation,
  ...detail,
  _id,
  customer: toCustomerInline(detail?.customer) ?? conversation?.customer,
  integration: integration ?? undefined,
  loading,
});
