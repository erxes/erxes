import { IContext } from '~/connectionResolvers';
import { ITriageAddInput, ITriageUpdateInput } from '@/task/@types/triage';
import { STATUS_TYPES } from '@/status/constants/types';
import { hasContactFields } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const TRIAGE_CONTENT_TYPE = 'operation:triage';
// Triages were related as tasks before they had a type of their own; an
// accepted triage's task takes its id, so those links are the task's.
const LEGACY_TRIAGE_CONTENT_TYPE = 'operation:task';

const getRelatedIds = (
  subdomain: string,
  contentType: string,
  contentId: string,
  relatedContentType: string,
): Promise<string[]> =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: { contentType, contentId, relatedContentType },
    defaultValue: [],
  });

type TRelationEntity = { contentType: string; contentId: string };

/**
 * Moves the links an accepted triage has to other records (relations) to
 * the task that replaces it, then drops the triage's own.
 */
const moveTriageRelations = async (subdomain: string, triageId: string) => {
  const relations: { entities?: TRelationEntity[] }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationsByEntities',
    input: { contentType: TRIAGE_CONTENT_TYPE, contentId: triageId },
    defaultValue: [],
  });
  const isTriage = (entity: TRelationEntity) =>
    entity.contentType === TRIAGE_CONTENT_TYPE && entity.contentId === triageId;
  const moved = relations
    .filter(({ entities = [] }) => entities.some(isTriage))
    .map(({ entities = [] }) => ({
      entities: entities.map(({ contentType, contentId }) =>
        isTriage({ contentType, contentId })
          ? { contentType: LEGACY_TRIAGE_CONTENT_TYPE, contentId }
          : { contentType, contentId },
      ),
    }));

  if (moved.length) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'relation',
      action: 'createMultipleRelations',
      input: { relations: moved },
      defaultValue: [],
    });
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'relation',
    action: 'cleanRelation',
    input: { contentType: TRIAGE_CONTENT_TYPE, contentIds: [triageId] },
    defaultValue: null,
  });
};

// A triage's customer and company: its fields once migrated, else the first
// of its relations under either type.
const getTriageContacts = async (
  subdomain: string,
  triage: {
    _id: unknown;
    customerId?: string | null;
    companyId?: string | null;
  },
) => {
  if (hasContactFields(triage)) {
    return { customerId: triage.customerId, companyId: triage.companyId };
  }

  const triageId = String(triage._id);
  const [customers, companies] = await Promise.all(
    ['core:customer', 'core:company'].map(async (relatedContentType) =>
      (
        await Promise.all(
          [TRIAGE_CONTENT_TYPE, LEGACY_TRIAGE_CONTENT_TYPE].map((type) =>
            getRelatedIds(subdomain, type, triageId, relatedContentType),
          ),
        )
      )
        .flat()
        .filter(Boolean),
    ),
  );

  return { customerId: customers[0] ?? null, companyId: companies[0] ?? null };
};

export const triageMutations = {
  operationAddTriage: async (
    _parent: undefined,
    { input }: { input: ITriageAddInput },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('triageCreate');

    const triage = await models.Triage.createTriage({
      triage: {
        name: input.name,
        description: input.description,
        teamId: input.teamId,
        createdBy: user._id,
        type: 'triage',
        number: 0,
        priority: input.priority || 0,
        status: input.status || STATUS_TYPES.TRIAGE,
        customerId: input.customerId || null,
        companyId: input.companyId || null,
      },
      subdomain: subdomain,
    });

    return triage;
  },

  operationUpdateTriage: async (
    _parent: undefined,
    { _id, input }: { _id: string; input: ITriageUpdateInput },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('triageUpdate');

    return models.Triage.updateTriage(_id, input);
  },

  operationCancelTriage: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('triageUpdate');

    const triage = await models.Triage.getTriage(_id);
    if (!triage) {
      throw new Error('Triage not found');
    }

    return models.Triage.updateTriage(_id, { status: STATUS_TYPES.CANCELLED });
  },

  operationConvertTriageToTask: async (
    _parent: undefined,
    { _id, status, reason }: { _id: string; status?: number; reason?: string },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('triageConvert');

    const triage = await models.Triage.getTriage(_id);
    if (!triage) {
      throw new Error('Triage not found');
    }

    let statusId: string | undefined = undefined;

    if (typeof status === 'number') {
      const statusDoc = await models.Status.findOne({
        teamId: triage.teamId,
        type: status,
      });

      if (!statusDoc) {
        throw new Error('Status not found');
      }
      statusId = statusDoc._id;
    }

    // The task takes the triage's _id (see Task.createTask) and keeps its
    // customers and companies.
    const contacts = await getTriageContacts(subdomain, triage);

    const task = await models.Task.createTask({
      doc: {
        ...contacts,
        name: triage.name,
        description: triage.description,
        teamId: triage.teamId,
        priority: triage.priority || 0,
        status: statusId,
        triageId: _id,
        createdBy: triage.createdBy,
        githubIssueNumber: triage.githubIssueNumber,
        githubIssueUrl: triage.githubIssueUrl,
        githubRepoName: triage.githubRepoName,
      },
      userId: user._id,
      subdomain: subdomain,
    });

    if (task) {
      await moveTriageRelations(subdomain, _id);

      if (reason) {
        await models.Note.createNote({
          doc: {
            content: reason,
            contentId: task._id,
            createdBy: user._id,
          },
          subdomain,
        });
      }
      if (status !== STATUS_TYPES.CANCELLED) {
        await models.Activity.createActivity({
          action: 'ACCEPTED',
          contentId: task._id,
          module: 'TRIAGE_ACCEPTANCE',
          metadata: {
            newValue: task._id.toString(),
            previousValue: triage._id?.toString(),
          },
          createdBy: user._id,
        });
      }
      await models.Triage.deleteTriage(_id);
      return task;
    } else {
      throw new Error('Failed to convert triage to task');
    }
  },
};
