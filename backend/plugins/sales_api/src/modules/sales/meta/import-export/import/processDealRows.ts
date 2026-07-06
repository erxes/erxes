import { IModels } from '~/connectionResolvers';
import { createRelations, getNewOrder } from '~/modules/sales/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { buildDealImportDoc, parseCustomFieldsData, parseList } from './utils';

const DEAL_TYPE = 'deal';

const getString = (value: unknown) => String(value || '').trim();

const uniq = (values: Array<string | undefined>) => [
  ...new Set(values.filter(Boolean) as string[]),
];

const resolveStageId = async (
  models: IModels,
  row: any,
  userId: string,
): Promise<string> => {
  const stageId = getString(row.stageId);

  if (stageId) {
    const stage = await models.Stages.findOne({ _id: stageId })
      .select('_id')
      .lean();

    if (!stage) {
      throw new Error(`Stage "${stageId}" was not found`);
    }

    return String(stage._id);
  }

  const boardName = getString(row.boardName || row.board);
  const pipelineName = getString(row.pipelineName || row.pipeline);
  const stageName = getString(row.stageName || row.stage);

  if (!boardName || !pipelineName || !stageName) {
    throw new Error(
      'Stage ID or Board Name, Pipeline Name, and Stage Name are required',
    );
  }

  let board: any = await models.Boards.findOne({
    name: boardName,
    type: DEAL_TYPE,
  });

  if (!board) {
    board = await models.Boards.createBoard(
      {
        name: boardName,
        type: DEAL_TYPE,
      },
      userId,
    );
  }

  let pipeline: any = await models.Pipelines.findOne({
    boardId: board._id,
    name: pipelineName,
    type: DEAL_TYPE,
  });

  if (!pipeline) {
    pipeline = await models.Pipelines.createPipeline(
      {
        boardId: board._id,
        name: pipelineName,
        type: DEAL_TYPE,
      },
      undefined,
      userId,
    );
  }

  let stage: any = await models.Stages.findOne({
    pipelineId: pipeline._id,
    name: stageName,
    type: DEAL_TYPE,
  });

  if (!stage) {
    stage = await models.Stages.createStage(
      {
        pipelineId: pipeline._id,
        name: stageName,
        type: DEAL_TYPE,
      },
      userId,
    );
  }

  return String(stage._id);
};

const resolveAssignedUserIds = async (
  subdomain: string,
  row: any,
): Promise<string[] | undefined> => {
  const directUserIds = parseList(row.assignedUserIds);
  const userKeys = parseList(row.assignedUserEmail || row.assignedUsers);

  if (!userKeys.length) {
    return directUserIds.length ? directUserIds : undefined;
  }

  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: {
      query: {
        $or: [
          { _id: { $in: userKeys } },
          { email: { $in: userKeys } },
          { username: { $in: userKeys } },
        ],
      },
      fields: { _id: 1 },
    },
  });

  if (!Array.isArray(users)) {
    throw new Error('Assigned user lookup returned an invalid response');
  }

  return uniq([...directUserIds, ...users.map((user: any) => user._id)]);
};

const resolveContactIds = async ({
  subdomain,
  module,
  directIds,
  lookupValues,
  label,
}: {
  subdomain: string;
  module: 'customers' | 'companies';
  directIds: string[];
  lookupValues: string[];
  label: string;
}) => {
  if (!lookupValues.length) {
    return directIds.length ? directIds : undefined;
  }

  const commonQuery =
    module === 'customers'
      ? {
          $or: [
            { _id: { $in: lookupValues } },
            { primaryEmail: { $in: lookupValues } },
            { primaryPhone: { $in: lookupValues } },
            { 'emails.email': { $in: lookupValues } },
            { 'phones.phone': { $in: lookupValues } },
            { code: { $in: lookupValues } },
          ],
        }
      : {
          $or: [
            { _id: { $in: lookupValues } },
            { primaryName: { $in: lookupValues } },
            { primaryEmail: { $in: lookupValues } },
            { primaryPhone: { $in: lookupValues } },
            { names: { $in: lookupValues } },
            { 'emails.email': { $in: lookupValues } },
            { 'phones.phone': { $in: lookupValues } },
            { code: { $in: lookupValues } },
          ],
        };

  const docs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action: 'find',
    input: {
      query: {
        status: { $ne: 'deleted' },
        ...commonQuery,
      },
    },
  });

  if (!Array.isArray(docs)) {
    throw new Error(`${label} lookup returned an invalid response`);
  }

  return uniq([...directIds, ...docs.map((doc: any) => doc._id)]);
};

const resolveLabelIds = async (
  models: IModels,
  row: any,
  stageId: string,
): Promise<string[] | undefined> => {
  const directValues = parseList(row.labelIds);
  const labelNames = parseList(row.labels);
  const values = uniq([...directValues, ...labelNames]);

  if (!values.length) {
    return undefined;
  }

  const stage = await models.Stages.findOne({ _id: stageId }).lean();
  const labels = await models.PipelineLabels.find({
    ...(stage?.pipelineId ? { pipelineId: stage.pipelineId } : {}),
    $or: [{ _id: { $in: values } }, { name: { $in: values } }],
  }).lean();

  const resolvedIds = labels.map((label) => String(label._id));
  const rawDirectIds = directValues.filter(
    (value) =>
      !labels.some(
        (label) => String(label._id) === value || label.name === value,
      ),
  );

  return uniq([...resolvedIds, ...rawDirectIds]);
};

const prepareCustomFieldsData = async (subdomain: string, row: any) => {
  const jsonCustomFieldsData =
    parseCustomFieldsData(row.customFieldsData) || [];
  const columnCustomFieldsData = Object.entries(row)
    .filter(([key, value]) => key.startsWith('customFieldsData.') && value)
    .map(([key, value]) => ({
      field: key.replace('customFieldsData.', ''),
      value,
    }));
  const customFieldsData = [...jsonCustomFieldsData, ...columnCustomFieldsData];

  if (!customFieldsData.length) {
    return undefined;
  }

  const preparedCustomFields = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'fields',
    action: 'prepareCustomFieldsData',
    input: customFieldsData,
  });

  if (!Array.isArray(preparedCustomFields)) {
    throw new Error('Custom field preparation returned an invalid response');
  }

  return preparedCustomFields;
};

export async function processDealRows(
  models: IModels,
  subdomain: string,
  rows: any[],
  userId: string,
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  for (const row of rows) {
    try {
      const stageId = await resolveStageId(models, row, userId);
      const assignedUserIds = await resolveAssignedUserIds(subdomain, row);
      const labelIds = await resolveLabelIds(models, row, stageId);
      const customerIds = await resolveContactIds({
        subdomain,
        module: 'customers',
        directIds: parseList(row.customerIds),
        lookupValues: parseList(row.customers),
        label: 'Customer',
      });
      const companyIds = await resolveContactIds({
        subdomain,
        module: 'companies',
        directIds: parseList(row.companyIds),
        lookupValues: parseList(row.companies),
        label: 'Company',
      });
      const customFieldsData = await prepareCustomFieldsData(subdomain, row);
      const doc = buildDealImportDoc(row, userId, {
        stageId,
        assignedUserIds,
        labelIds,
        customerIds,
        companyIds,
        customFieldsData,
      });

      const deal = await models.Deals.createDeal({
        ...doc,
        order: await getNewOrder({
          collection: models.Deals,
          stageId: doc.stageId,
        }),
      });

      try {
        await createRelations(subdomain, {
          dealId: deal._id,
          customerIds: doc.customerIds,
          companyIds: doc.companyIds,
        });
      } catch (relationError: any) {
        try {
          await models.Deals.deleteOne({ _id: deal._id });
        } catch (cleanupError: any) {
          const errorMessage = [
            relationError?.message || 'Failed to create relations',
            `Rollback failed for deal ${deal._id}`,
            cleanupError?.message || 'unknown error',
          ].join('; ');
          const wrappedError = new Error(errorMessage);
          (wrappedError as any).cause = relationError;

          throw wrappedError;
        }

        throw relationError;
      }

      successRows.push({ ...row, _id: deal._id });
    } catch (error: any) {
      errorRows.push({
        ...row,
        error: error?.message || 'Failed to import deal row',
      });
    }
  }

  return { successRows, errorRows };
}
