import { IModels } from '~/connectionResolvers';

export const mergeMutationNames = ['customersMerge', 'companiesMerge'] as const;

type MergeMutationName = (typeof mergeMutationNames)[number];

type MergeMutationData = {
  mutationName?: string;
  args?: {
    customerIds?: string[];
    companyIds?: string[];
  };
  result?: {
    _id?: string;
  };
};

type ArrayReference = {
  model: keyof Pick<IModels, 'Ticket'>;
  path: string;
};

const isMergeMutationName = (
  mutationName?: string,
): mutationName is MergeMutationName =>
  Boolean(
    mutationName &&
      (mergeMutationNames as readonly string[]).includes(mutationName),
  );

const getMergeIds = (data: MergeMutationData) => {
  const newId = data.result?._id;

  if (!newId || !isMergeMutationName(data.mutationName)) {
    return null;
  }

  if (data.mutationName === 'customersMerge') {
    return {
      type: 'customer' as const,
      oldIds: data.args?.customerIds || [],
      newId,
    };
  }

  return {
    type: 'company' as const,
    oldIds: data.args?.companyIds || [],
    newId,
  };
};

const replaceArrayReferences = async (
  models: IModels,
  { model, path }: ArrayReference,
  oldIds: string[],
  newId: string,
) => {
  await models[model].updateMany(
    { [path]: { $in: oldIds } },
    { $addToSet: { [path]: newId } },
  );

  await models[model].updateMany(
    { [path]: { $in: oldIds } },
    { $pull: { [path]: { $in: oldIds } } },
  );
};

const updateCustomerIdField = async (
  models: IModels,
  oldIds: string[],
  newId: string,
) => {
  await Promise.all([
    models.Conversations.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.ConversationMessages.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.Integrations.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.FormSubmissions.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.FacebookCustomers.updateMany(
      { erxesApiId: { $in: oldIds } },
      { $set: { erxesApiId: newId } },
    ),
    models.FacebookConversationMessages.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.FacebookCommentConversation.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.FacebookCommentConversationReply.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.FacebookPostConversations.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.InstagramCustomers.updateMany(
      { erxesApiId: { $in: oldIds } },
      { $set: { erxesApiId: newId } },
    ),
    models.InstagramConversationMessages.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.InstagramCommentConversation.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.InstagramCommentConversationReply.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.InstagramPostConversations.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.CallSessions.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.CallCdrs.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.CallCustomers.updateMany(
      { erxesApiId: { $in: oldIds } },
      { $set: { erxesApiId: newId } },
    ),
  ]);

  await replaceArrayReferences(
    models,
    { model: 'Ticket', path: 'customerFieldData.customerIds' },
    oldIds,
    newId,
  );
};

export const handleCoreMergeMutation = async (
  models: IModels,
  data?: MergeMutationData,
) => {
  const mergeIds = getMergeIds(data || {});

  if (!mergeIds || mergeIds.oldIds.length === 0) {
    return;
  }

  if (mergeIds.type === 'customer') {
    await updateCustomerIdField(models, mergeIds.oldIds, mergeIds.newId);
    return;
  }

  await replaceArrayReferences(
    models,
    { model: 'Ticket', path: 'companyIds' },
    mergeIds.oldIds,
    mergeIds.newId,
  );
};
