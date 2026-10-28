import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { IStructureEntityDocument } from 'erxes-api-shared/core-types';
import { STRUCTURE_ENTITY_STATUSES } from '../../constants';
import {
  activeMembershipFilter,
  getStructureCapabilities,
  orderPrefixFilter,
} from '../../utils';

export interface IStructureEntitiesParams extends ICursorPaginateParams {
  ids?: string[];
  excludeIds?: boolean;
  typeIds?: string[];
  parentId?: string;
  descendantOf?: string;
  capability?: string;
  includeArchived?: boolean;
  searchValue?: string;
}

const buildEntityFilter = async (
  { models }: IContext,
  params: IStructureEntitiesParams,
) => {
  const and: FilterQuery<IStructureEntityDocument>[] = [];

  if (!params.includeArchived) {
    and.push({ status: STRUCTURE_ENTITY_STATUSES.ACTIVE });
  }

  if (params.ids?.length) {
    and.push({ _id: { [params.excludeIds ? '$nin' : '$in']: params.ids } });
  }

  if (params.typeIds?.length) {
    and.push({ typeId: { $in: params.typeIds } });
  }

  if (params.parentId) {
    and.push({ parentId: params.parentId });
  }

  if (params.descendantOf) {
    const ancestor = await models.StructureEntities.getEntity(
      params.descendantOf,
    );

    and.push(orderPrefixFilter([ancestor.order]));
  }

  if (params.capability) {
    const typeIds = await models.StructureEntityTypes.distinct('_id', {
      capabilities: params.capability,
    });

    and.push({ typeId: { $in: typeIds } });
  }

  if (params.searchValue) {
    const regex = new RegExp(escapeRegExp(params.searchValue.trim()), 'i');

    and.push({
      $or: [{ title: regex }, { code: regex }, { description: regex }],
    });
  }

  return and.length ? { $and: and } : {};
};

export const structureQueries = {
  async structureCapabilities(
    _root: undefined,
    _args: undefined,
    { checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');

    return getStructureCapabilities();
  },

  async structureEntityTypes(
    _root: undefined,
    { searchValue, capability }: { searchValue?: string; capability?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');
    await models.StructureEntityTypes.getOrganizationType();

    const filter: Record<string, unknown> = {};

    if (searchValue) {
      const regex = new RegExp(escapeRegExp(searchValue.trim()), 'i');

      filter.$or = [{ name: regex }, { code: regex }];
    }

    if (capability) {
      filter.capabilities = capability;
    }

    return models.StructureEntityTypes.find(filter).sort({
      isSystem: -1,
      name: 1,
    });
  },

  async structureEntityTypeDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');

    return models.StructureEntityTypes.getType(_id);
  },

  async structureEntityRoot(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');

    const root = await models.StructureEntities.getRoot();

    return models.StructureEntities.findOne({ _id: root._id });
  },

  async structureEntities(
    _root: undefined,
    params: IStructureEntitiesParams,
    context: IContext,
  ) {
    await context.checkPermission('structuresRead');

    return cursorPaginate({
      model: context.models.StructureEntities,
      params: { ...params, orderBy: params.orderBy || { order: 1 } },
      query: await buildEntityFilter(context, params),
    });
  },

  async structureEntityDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');

    return models.StructureEntities.getEntity(_id);
  },

  async structureEntityMembers(
    _root: undefined,
    {
      entityId,
      userId,
      includeEnded,
    }: { entityId?: string; userId?: string; includeEnded?: boolean },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');

    if (!entityId && !userId) {
      throw new Error('Choose a node or a user');
    }

    const filter: Record<string, unknown> = includeEnded
      ? {}
      : activeMembershipFilter();

    if (entityId) {
      filter.entityId = entityId;
    }

    if (userId) {
      filter.userId = userId;
    }

    const members = await models.StructureEntityMembers.find(filter)
      .sort({ startsAt: -1 })
      .lean();

    const visibleIds = await models.StructureEntities.distinct('_id', {
      _id: { $in: [...new Set(members.map((member) => member.entityId))] },
    });

    return members.filter((member) => visibleIds.includes(member.entityId));
  },

  async structurePositions(
    _root: undefined,
    { searchValue }: { searchValue?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');

    const filter: Record<string, unknown> = {};

    if (searchValue) {
      filter.name = new RegExp(escapeRegExp(searchValue.trim()), 'i');
    }

    return models.StructurePositions.find(filter).sort({ name: 1 });
  },

  async structureSeats(
    _root: undefined,
    { entityId, userId }: { entityId?: string; userId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresRead');

    const filter: Record<string, unknown> = {};

    if (entityId) {
      filter.entityId = entityId;
    }

    if (userId) {
      filter._id = {
        $in: await models.StructureEntityMembers.distinct('seatIds', {
          userId,
          ...activeMembershipFilter(),
        }),
      };
    }

    const seats = await models.StructureSeats.find(filter)
      .sort({ createdAt: 1 })
      .lean();
    const visibleIds = await models.StructureEntities.distinct('_id', {
      _id: { $in: [...new Set(seats.map((seat) => seat.entityId))] },
    });

    return seats.filter((seat) => visibleIds.includes(seat.entityId));
  },
};
