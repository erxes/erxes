import {
  IAttachment,
  ICursorPaginateParams,
  ILink,
  IStructureCoordinate,
  IStructureEntityDocument,
  TStructureLegacyKind,
} from 'erxes-api-shared/core-types';
import { escapeRegExp, withoutPermissionScope } from 'erxes-api-shared/utils';
import { GraphQLResolveInfo } from 'graphql';
import { IContext, IModels } from '~/connectionResolvers';
import {
  STRUCTURE_ENTITY_STATUSES,
  STRUCTURE_SEAT_COVERAGES,
} from '../../constants';
import {
  activeMembershipFilter,
  getActiveMemberIds,
  pathIdsOf,
} from '../../utils';

const LEGACY_STATUSES = { ACTIVE: 'active', DELETED: 'deleted' };

const CP_USER_FIELDS: Record<string, 1> = {
  _id: 1,
  username: 1,
  email: 1,
  'details.avatar': 1,
  'details.fullName': 1,
  'details.shortName': 1,
  'details.position': 1,
  propertiesData: 1,
};

export interface ILegacyNode {
  _id: string;
  typeId: string;
  title: string;
  description?: string;
  code?: string;
  order: string;
  status: string;
  parentId?: string;
  address?: string;
  radius?: number;
  coordinate?: IStructureCoordinate;
  phoneNumber?: string;
  email?: string;
  links?: ILink;
  image?: IAttachment;
  workhours?: Record<string, unknown>;
  holidays?: Record<string, unknown>[];
}

export interface ILegacyListParams extends ICursorPaginateParams {
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  status?: string;
  onlyFirstLevel?: boolean;
  parentId?: string;
}

const nearestAncestorId = (order: string, selfId: string, ids: Set<string>) =>
  pathIdsOf(order)
    .filter((id) => id !== selfId)
    .reverse()
    .find((id) => ids.has(id));

const toLegacyNode = (
  node: IStructureEntityDocument,
  ids: Set<string>,
): ILegacyNode => ({
  _id: node._id,
  typeId: node.typeId,
  title: node.title,
  description: node.description,
  code: node.code,
  order: node.order,
  status:
    node.status === STRUCTURE_ENTITY_STATUSES.ARCHIVED
      ? LEGACY_STATUSES.DELETED
      : LEGACY_STATUSES.ACTIVE,
  parentId: nearestAncestorId(node.order, node._id, ids),
  address: node.location?.address,
  radius: node.location?.radius,
  coordinate: node.location?.coordinate,
  phoneNumber: node.contact?.phoneNumber,
  email: node.contact?.email,
  links: node.contact?.links,
  image: node.contact?.image,
  workhours: node.schedule?.workhours,
  holidays: node.schedule?.holidays,
});

const loadLegacyNodes = (models: IModels, kind: TStructureLegacyKind) =>
  withoutPermissionScope(async () => {
    const type = await models.StructureEntityTypes.findOne({
      legacyKind: kind,
    }).lean();

    if (!type) {
      return [];
    }

    const nodes = await models.StructureEntities.find({ typeId: type._id })
      .sort({ order: 1 })
      .lean<IStructureEntityDocument[]>();
    const ids = new Set(nodes.map((node) => node._id));

    return nodes.map((node) => toLegacyNode(node, ids));
  });

const loadLegacyNode = async (
  models: IModels,
  kind: TStructureLegacyKind,
  _id: string,
) =>
  (await loadLegacyNodes(models, kind)).find((node) => node._id === _id) ||
  null;

const filterLegacyNodes = (nodes: ILegacyNode[], params: ILegacyListParams) => {
  const regex = params.searchValue
    ? new RegExp(escapeRegExp(params.searchValue.trim()), 'i')
    : null;

  return nodes.filter((node) => {
    if (
      params.status
        ? node.status !== params.status
        : node.status === LEGACY_STATUSES.DELETED
    ) {
      return false;
    }

    if (
      params.ids?.length &&
      params.ids.includes(node._id) === !!params.excludeIds
    ) {
      return false;
    }

    if (params.onlyFirstLevel && node.parentId) {
      return false;
    }

    if (params.parentId && node.parentId !== params.parentId) {
      return false;
    }

    return (
      !regex ||
      [node.title, node.description, node.code].some(
        (value) => !!value && regex.test(value),
      )
    );
  });
};

const paginateLegacyNodes = (
  nodes: ILegacyNode[],
  { limit = 20, cursor, direction = 'forward' }: ICursorPaginateParams,
) => {
  const index = cursor ? nodes.findIndex((node) => node._id === cursor) : -1;
  const start =
    direction === 'forward' ? index + 1 : Math.max(0, index - limit);
  const end = direction === 'forward' ? start + limit : Math.max(0, index);
  const list = nodes.slice(start, end);

  return {
    list,
    totalCount: nodes.length,
    pageInfo: {
      hasNextPage: end < nodes.length,
      hasPreviousPage: start > 0,
      startCursor: list[0]?._id,
      endCursor: list[list.length - 1]?._id,
    },
  };
};

const findActiveUsers = (
  models: IModels,
  ids: string[],
  fields?: Record<string, 1>,
) =>
  withoutPermissionScope(() =>
    models.Users.find({ _id: { $in: ids }, isActive: true }, fields).lean(),
  );

const supervisorIdOf = async (models: IModels, node: ILegacyNode) => {
  const seats = await models.StructureSeats.find(
    { entityId: node._id },
    { coverage: 1 },
  ).lean();
  const belowIds = seats
    .filter((seat) => seat.coverage === STRUCTURE_SEAT_COVERAGES.BELOW)
    .map((seat) => seat._id);

  for (const seatIds of [belowIds, seats.map((seat) => seat._id)]) {
    if (!seatIds.length) {
      continue;
    }

    const member = await models.StructureEntityMembers.findOne({
      entityId: node._id,
      seatIds: { $in: seatIds },
      ...activeMembershipFilter(),
    })
      .sort({ startsAt: 1 })
      .lean();

    if (member) {
      return member.userId;
    }
  }

  return null;
};

const branchMemberIds = async (models: IModels, node: ILegacyNode) => {
  const branches = await loadLegacyNodes(models, 'branch');
  const subtree = branches
    .filter((branch) => branch.order.startsWith(node.order))
    .map((branch) => branch._id);

  return getActiveMemberIds(models, subtree);
};

const commonResolvers = (
  kind: TStructureLegacyKind,
  memberIds: (models: IModels, node: ILegacyNode) => Promise<string[]>,
) => ({
  __resolveReference: ({ _id }: { _id: string }, { models }: IContext) =>
    loadLegacyNode(models, kind, _id),

  supervisorId: (node: ILegacyNode, _args: undefined, { models }: IContext) =>
    supervisorIdOf(models, node),

  supervisor: async (
    node: ILegacyNode,
    _args: undefined,
    { models }: IContext,
  ) => {
    const userId = await supervisorIdOf(models, node);

    return userId
      ? withoutPermissionScope(() =>
          models.Users.findOne({ _id: userId, isActive: true }),
        )
      : null;
  },

  users: async (node: ILegacyNode, _args: undefined, { models }: IContext) =>
    findActiveUsers(models, await memberIds(models, node)),

  userIds: async (node: ILegacyNode, _args: undefined, { models }: IContext) =>
    (
      await findActiveUsers(models, await memberIds(models, node), { _id: 1 })
    ).map((user) => user._id),

  userCount: async (
    node: ILegacyNode,
    _args: undefined,
    { models }: IContext,
  ) =>
    (await findActiveUsers(models, await memberIds(models, node), { _id: 1 }))
      .length,

  parent: (node: ILegacyNode, _args: undefined, { models }: IContext) =>
    node.parentId ? loadLegacyNode(models, kind, node.parentId) : null,

  children: async (
    node: ILegacyNode,
    _args: undefined,
    { models }: IContext,
    { variableValues }: GraphQLResolveInfo,
  ) =>
    (await loadLegacyNodes(models, kind)).filter(
      (child) =>
        child.parentId === node._id &&
        (!variableValues?.status || child.status === variableValues.status),
    ),
});

const directMemberIds = (models: IModels, node: ILegacyNode) =>
  getActiveMemberIds(models, [node._id]);

export const legacyQueries = {
  async cpBranches(
    _root: undefined,
    params: ILegacyListParams,
    { models }: IContext,
  ) {
    const nodes = filterLegacyNodes(
      await loadLegacyNodes(models, 'branch'),
      params,
    );

    if (params.ids?.length && !params.excludeIds) {
      return params.ids
        .map((id) => nodes.find((node) => node._id === id))
        .filter(Boolean);
    }

    return nodes;
  },

  async cpBranchesMain(
    _root: undefined,
    params: ILegacyListParams,
    { models }: IContext,
  ) {
    return paginateLegacyNodes(
      filterLegacyNodes(await loadLegacyNodes(models, 'branch'), params),
      params,
    );
  },

  async cpBranchDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const node = await loadLegacyNode(models, 'branch', _id);

    if (!node) {
      throw new Error('Branch not found');
    }

    return node;
  },

  async cpDepartments(
    _root: undefined,
    params: ILegacyListParams,
    { models }: IContext,
  ) {
    return filterLegacyNodes(
      await loadLegacyNodes(models, 'department'),
      params,
    );
  },

  async cpUnits(
    _root: undefined,
    { searchValue }: { searchValue?: string },
    { models }: IContext,
  ) {
    const regex = searchValue
      ? new RegExp(escapeRegExp(searchValue.trim()), 'i')
      : null;

    return (await loadLegacyNodes(models, 'unit'))
      .filter(
        (node) =>
          !regex ||
          [node.title, node.description].some(
            (value) => !!value && regex.test(value),
          ),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  },
};

for (const query of Object.values(legacyQueries)) {
  Object.assign(query, { wrapperConfig: { forClientPortal: true } });
}

export const legacyCustomResolvers = {
  Branch: {
    ...commonResolvers('branch', branchMemberIds),

    hasChildren: async (
      node: ILegacyNode,
      _args: undefined,
      { models }: IContext,
    ) =>
      (await loadLegacyNodes(models, 'branch')).some(
        (child) => child.parentId === node._id,
      ),
  },

  Department: {
    ...commonResolvers('department', directMemberIds),

    childCount: async (
      node: ILegacyNode,
      _args: undefined,
      { models }: IContext,
    ) =>
      (await loadLegacyNodes(models, 'department')).filter(
        (child) => child.parentId === node._id,
      ).length,
  },

  CPUnit: {
    users: async (node: ILegacyNode, _args: undefined, { models }: IContext) =>
      findActiveUsers(
        models,
        await directMemberIds(models, node),
        CP_USER_FIELDS,
      ),

    department: async (
      node: ILegacyNode,
      _args: undefined,
      { models }: IContext,
    ) => {
      const departments = await loadLegacyNodes(models, 'department');
      const id = nearestAncestorId(
        node.order,
        node._id,
        new Set(departments.map((department) => department._id)),
      );
      const department = departments.find((item) => item._id === id);

      return department
        ? {
            _id: department._id,
            title: department.title,
            code: department.code,
            description: department.description,
          }
        : null;
    },
  },
};
