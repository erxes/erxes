import { IModels } from '~/connectionResolvers';

export const mergeMutationNames = ['customersMerge'] as const;

type MergeMutationName = (typeof mergeMutationNames)[number];

type MergeMutationData = {
  mutationName?: string;
  args?: {
    customerIds?: string[];
  };
  result?: {
    _id?: string;
  };
};

type ScalarReference = {
  model: keyof Pick<
    IModels,
    'Bookings' | 'Reviews' | 'TourBookings' | 'Orders'
  >;
  path: string;
};

type ArrayReference = {
  model: keyof Pick<IModels, 'Orders'>;
  path: string;
};

const customerScalarReferences: ScalarReference[] = [
  { model: 'Bookings', path: 'customerId' },
  { model: 'Reviews', path: 'customerId' },
  { model: 'TourBookings', path: 'customerId' },
  { model: 'Orders', path: 'customerId' },
];

const customerArrayReferences: ArrayReference[] = [
  { model: 'Orders', path: 'additionalCustomers' },
];

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

  return {
    oldIds: data.args?.customerIds || [],
    newId,
  };
};

const replaceScalarReference = async (
  models: IModels,
  { model, path }: ScalarReference,
  oldIds: string[],
  newId: string,
) => {
  await models[model].updateMany(
    { [path]: { $in: oldIds } },
    { $set: { [path]: newId } },
  );
};

const replaceArrayReference = async (
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

export const handleCoreMergeMutation = async (
  models: IModels,
  data?: MergeMutationData,
) => {
  const mergeIds = getMergeIds(data || {});

  if (!mergeIds || mergeIds.oldIds.length === 0) {
    return;
  }

  await Promise.all(
    customerScalarReferences.map((reference) =>
      replaceScalarReference(models, reference, mergeIds.oldIds, mergeIds.newId),
    ),
  );

  for (const reference of customerArrayReferences) {
    await replaceArrayReference(
      models,
      reference,
      mergeIds.oldIds,
      mergeIds.newId,
    );
  }
};
