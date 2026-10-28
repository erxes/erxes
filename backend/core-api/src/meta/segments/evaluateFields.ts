import {
  evaluateOwnedSegmentFields,
  SegmentDerivedRequest,
  SegmentEvaluateFieldsResult,
  SegmentOwnerContract,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { withoutPermissionScope } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  activeMembershipFilter,
  pathIdsOf,
} from '@/organization/structure/utils';
import { coreSegmentOwnedSource } from './collections';
import { CORE_SEGMENT_FIELDS } from './fields';
import { USER_STRUCTURE_SEGMENT_FIELD } from './fields/user';
import { CORE_SEGMENT_FIELD_NAMESPACES } from './namespaces';
import { CORE_SEGMENT_RELATIONS } from './relations';

const resolveUserStructureEntityIds = async (
  models: IModels,
  requests: SegmentDerivedRequest[],
  subjectIds: string[],
): Promise<Record<string, Record<string, unknown>>> => {
  const structureRequests = requests.filter(
    (request) => request.fieldKey === USER_STRUCTURE_SEGMENT_FIELD,
  );

  if (!structureRequests.length || !subjectIds.length) {
    return {};
  }

  const memberships = await models.StructureEntityMembers.find(
    { userId: { $in: subjectIds }, ...activeMembershipFilter() },
    { userId: 1, entityId: 1 },
  ).lean();

  const entities = await withoutPermissionScope(() =>
    models.StructureEntities.find(
      { _id: { $in: memberships.map((membership) => membership.entityId) } },
      { order: 1 },
    ).lean(),
  );

  const pathIdsById = new Map(
    entities.map((entity) => [entity._id, pathIdsOf(entity.order)]),
  );

  return Object.fromEntries(
    subjectIds.map((userId) => {
      const entityIds = [
        ...new Set(
          memberships
            .filter((membership) => membership.userId === userId)
            .flatMap(
              (membership) => pathIdsById.get(membership.entityId) || [],
            ),
        ),
      ];

      return [
        userId,
        Object.fromEntries(
          structureRequests.map((request) => [request.ref, entityIds]),
        ),
      ];
    }),
  );
};

const contract = (models: IModels): SegmentOwnerContract => ({
  sourceFor: (contentType) => coreSegmentOwnedSource(models, contentType),
  fields: CORE_SEGMENT_FIELDS,
  namespaces: CORE_SEGMENT_FIELD_NAMESPACES,
  relations: CORE_SEGMENT_RELATIONS,

  resolveDerived: ({ requests, subjectIds }) =>
    resolveUserStructureEntityIds(models, requests, subjectIds),
});

export const evaluateCoreFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> =>
  evaluateOwnedSegmentFields(contract(models), data);
