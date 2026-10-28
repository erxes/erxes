import {
  bumpPermissionCacheVersion,
  isPropertyGroupKey,
  propertyGroupIdFromKey,
} from 'erxes-api-shared/core-modules';
import {
  IStructureContact,
  IStructureEntity,
  IStructureEntityDocument,
  IStructureEntityMember,
  IStructureEntityMemberDocument,
  IStructureEntityType,
  IStructureEntityTypeDocument,
  IStructureLocation,
  IStructureSchedule,
} from 'erxes-api-shared/core-types';
import { escapeRegExp, withoutPermissionScope } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ORGANIZATION_TYPE_CODE,
  STRUCTURE_CAPABILITIES,
  STRUCTURE_ENTITY_STATUSES,
  STRUCTURE_PROPERTIES_CONTENT_TYPE,
} from '../../constants';
import { activeMembershipFilter } from '../../utils';
import {
  structureEntityMemberSchema,
  structureEntitySchema,
  structureEntityTypeSchema,
} from '../definitions/structure';

export type TStructureEntityTypeInput = Omit<IStructureEntityType, 'isSystem'>;

export interface IStructureEntityInput {
  typeId: string;
  parentId: string;
  title: string;
  code?: string;
  description?: string;
  location?: IStructureLocation;
  contact?: IStructureContact;
  schedule?: IStructureSchedule;
  propertiesData?: IStructureEntity['propertiesData'];
}

export type TStructureEntityEditInput = Partial<
  Omit<IStructureEntityInput, 'typeId' | 'parentId'>
>;

export interface IStructureEntityMemberInput {
  entityId: string;
  userId: string;
  seatIds?: string[];
  isPrimary?: boolean;
  startsAt?: Date;
  endsAt?: Date;
}

export interface IStructureEntityTypeModel
  extends Model<IStructureEntityTypeDocument> {
  getType(_id: string): Promise<IStructureEntityTypeDocument>;
  getOrganizationType(): Promise<IStructureEntityTypeDocument>;
  createType(
    doc: TStructureEntityTypeInput,
    userId: string,
  ): Promise<IStructureEntityTypeDocument>;
  updateType(
    _id: string,
    doc: Partial<TStructureEntityTypeInput>,
    userId: string,
  ): Promise<IStructureEntityTypeDocument>;
  removeType(_id: string): Promise<IStructureEntityTypeDocument>;
}

export interface IStructureEntityModel extends Model<IStructureEntityDocument> {
  getEntity(_id: string): Promise<IStructureEntityDocument>;
  getRoot(): Promise<IStructureEntityDocument>;
  createEntity(
    doc: IStructureEntityInput,
    userId: string,
  ): Promise<IStructureEntityDocument>;
  updateEntity(
    _id: string,
    doc: TStructureEntityEditInput,
    userId: string,
  ): Promise<IStructureEntityDocument>;
  moveEntity(
    _id: string,
    parentId: string,
    userId: string,
  ): Promise<IStructureEntityDocument>;
  changeType(
    _id: string,
    typeId: string,
    userId: string,
  ): Promise<IStructureEntityDocument>;
  archiveEntity(_id: string, userId: string): Promise<IStructureEntityDocument>;
  restoreEntity(_id: string, userId: string): Promise<IStructureEntityDocument>;
  setPropertyValues(
    _id: string,
    values: Record<string, unknown>,
  ): Promise<IStructureEntityDocument>;
}

export interface IStructureEntityMemberModel
  extends Model<IStructureEntityMemberDocument> {
  getMember(_id: string): Promise<IStructureEntityMemberDocument>;
  addMember(
    doc: IStructureEntityMemberInput,
    actorId: string,
  ): Promise<IStructureEntityMemberDocument>;
  updateMember(
    _id: string,
    doc: Partial<Pick<IStructureEntityMember, 'isPrimary' | 'endsAt'>>,
    actorId: string,
  ): Promise<IStructureEntityMemberDocument>;
  addSeat(
    entityId: string,
    userId: string,
    seatId: string,
    actorId: string,
  ): Promise<IStructureEntityMemberDocument>;
  removeSeat(entityId: string, userId: string, seatId: string): Promise<void>;
  endMember(
    _id: string,
    actorId: string,
    endsAt?: Date,
  ): Promise<IStructureEntityMemberDocument>;
}

const pickCapabilityData = (
  type: IStructureEntityTypeDocument,
  doc: TStructureEntityEditInput,
) => {
  const enabled = type.capabilities || [];
  const data: TStructureEntityEditInput = {};

  if (doc.location && enabled.includes(STRUCTURE_CAPABILITIES.LOCATION)) {
    data.location = doc.location;
  }

  if (doc.contact && enabled.includes(STRUCTURE_CAPABILITIES.CONTACT)) {
    data.contact = doc.contact;
  }

  if (doc.schedule && enabled.includes(STRUCTURE_CAPABILITIES.SCHEDULE)) {
    data.schedule = doc.schedule;
  }

  return data;
};

const scopePropertiesData = async (
  models: IModels,
  typeId: string,
  data: IStructureEntity['propertiesData'],
  previous?: IStructureEntity['propertiesData'],
) => {
  if (!data) {
    return data;
  }

  const scope = {
    contentType: STRUCTURE_PROPERTIES_CONTENT_TYPE,
    contentTypeId: typeId,
  };
  const [fields, groupIds] = await Promise.all([
    models.Fields.find(scope, { _id: 1, code: 1 }).lean(),
    models.FieldsGroups.distinct('_id', scope),
  ]);
  const fieldKeys = new Set(
    fields.flatMap((field) => [field._id, field.code].filter(Boolean)),
  );
  const isTypeKey = (key: string) =>
    isPropertyGroupKey(key)
      ? groupIds.includes(propertyGroupIdFromKey(key))
      : fieldKeys.has(key);
  const scoped = Object.fromEntries(
    Object.entries(data).filter(([key]) => isTypeKey(key)),
  );
  const hidden = Object.fromEntries(
    Object.entries(previous || {}).filter(([key]) => !isTypeKey(key)),
  );
  const validated = await models.Fields.validateFieldValues(
    await models.Fields.keepFeaturedValues(scoped, previous),
  );

  return { ...hidden, ...validated };
};

const assertCodeAvailable = async (
  models: IModels,
  code: string | undefined,
  excludeId?: string,
) => {
  if (!code) {
    return;
  }

  const existing = await withoutPermissionScope(() =>
    models.StructureEntities.exists({
      code,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }),
  );

  if (existing) {
    throw new Error(`Code "${code}" is already used by another node`);
  }
};

const assertParentAllowed = (
  type: IStructureEntityTypeDocument,
  parent: IStructureEntityDocument,
) => {
  if (parent.status !== STRUCTURE_ENTITY_STATUSES.ACTIVE) {
    throw new Error('Parent node is archived');
  }

  const allowed = type.parentTypeIds || [];

  if (allowed.length && !allowed.includes(parent.typeId)) {
    throw new Error(`${type.name} cannot be placed under this node type`);
  }
};

export const loadStructureEntityTypeClass = (models: IModels) => {
  class StructureEntityType {
    public static async getType(_id: string) {
      const type = await models.StructureEntityTypes.findOne({ _id });

      if (!type) {
        throw new Error('Structure type not found');
      }

      return type;
    }

    public static async getOrganizationType() {
      const existing = await models.StructureEntityTypes.findOne({
        code: ORGANIZATION_TYPE_CODE,
        isSystem: true,
      });

      if (existing) {
        return existing;
      }

      return models.StructureEntityTypes.create({
        name: 'Organization',
        code: ORGANIZATION_TYPE_CODE,
        isSystem: true,
        capabilities: [
          STRUCTURE_CAPABILITIES.LOCATION,
          STRUCTURE_CAPABILITIES.CONTACT,
        ],
      });
    }

    public static async createType(
      doc: TStructureEntityTypeInput,
      userId: string,
    ) {
      if (await models.StructureEntityTypes.exists({ code: doc.code })) {
        throw new Error(`Type code "${doc.code}" is already used`);
      }

      return models.StructureEntityTypes.create({
        ...doc,
        isSystem: false,
        createdBy: userId,
      });
    }

    public static async updateType(
      _id: string,
      doc: Partial<TStructureEntityTypeInput>,
      userId: string,
    ) {
      const type = await models.StructureEntityTypes.getType(_id);
      const update: Partial<TStructureEntityTypeInput> = { ...doc };

      if (type.isSystem) {
        delete update.code;
        delete update.parentTypeIds;
        delete update.legacyKind;
      }

      if (
        update.code &&
        update.code !== type.code &&
        (await models.StructureEntityTypes.exists({ code: update.code }))
      ) {
        throw new Error(`Type code "${update.code}" is already used`);
      }

      if (update.legacyKind) {
        await models.StructureEntityTypes.updateMany(
          { _id: { $ne: _id }, legacyKind: update.legacyKind },
          { $unset: { legacyKind: 1 } },
        );
      }

      await models.StructureEntityTypes.updateOne(
        { _id },
        { $set: { ...update, updatedBy: userId } },
      );

      return models.StructureEntityTypes.getType(_id);
    }

    public static async removeType(_id: string) {
      const type = await models.StructureEntityTypes.getType(_id);

      if (type.isSystem) {
        throw new Error('The organization type cannot be removed');
      }

      const count = await withoutPermissionScope(() =>
        models.StructureEntities.countDocuments({ typeId: _id }),
      );

      if (count) {
        throw new Error(
          `${count} node(s) use this type. Move or change them first`,
        );
      }

      await models.StructureEntityTypes.updateMany(
        { parentTypeIds: _id },
        { $pull: { parentTypeIds: _id } },
      );
      await models.StructureEntityTypes.deleteOne({ _id });

      return type;
    }
  }

  structureEntityTypeSchema.loadClass(StructureEntityType);

  return structureEntityTypeSchema;
};

export const loadStructureEntityClass = (
  models: IModels,
  subdomain: string,
) => {
  class StructureEntity {
    public static async getEntity(_id: string) {
      const entity = await models.StructureEntities.findOne({ _id });

      if (!entity) {
        throw new Error('Structure node not found');
      }

      return entity;
    }

    public static async getRoot() {
      const type = await models.StructureEntityTypes.getOrganizationType();
      const root = await withoutPermissionScope(() =>
        models.StructureEntities.findOne({
          typeId: type._id,
          parentId: { $in: [null, ''] },
        }),
      );

      if (root) {
        return root;
      }

      const created = new models.StructureEntities({
        typeId: type._id,
        title: type.name,
      });

      created.order = `${created._id}/`;

      return created.save();
    }

    public static async createEntity(
      doc: IStructureEntityInput,
      userId: string,
    ) {
      const type = await models.StructureEntityTypes.getType(doc.typeId);

      if (type.isSystem) {
        throw new Error('Only the root uses the organization type');
      }

      const parent = await models.StructureEntities.getEntity(doc.parentId);

      assertParentAllowed(type, parent);
      await assertCodeAvailable(models, doc.code);

      const entity = new models.StructureEntities({
        typeId: type._id,
        parentId: parent._id,
        title: doc.title,
        code: doc.code || undefined,
        description: doc.description,
        propertiesData: await scopePropertiesData(
          models,
          type._id,
          doc.propertiesData,
        ),
        ...pickCapabilityData(type, doc),
        createdBy: userId,
      });

      entity.order = `${parent.order}${entity._id}/`;

      const saved = await entity.save();

      await bumpPermissionCacheVersion(subdomain);

      return saved;
    }

    public static async updateEntity(
      _id: string,
      doc: TStructureEntityEditInput,
      userId: string,
    ) {
      const entity = await models.StructureEntities.getEntity(_id);
      const type = await models.StructureEntityTypes.getType(entity.typeId);

      if (doc.code !== undefined) {
        await assertCodeAvailable(models, doc.code, _id);
      }

      const update: Record<string, unknown> = {
        ...pickCapabilityData(type, doc),
        updatedBy: userId,
      };

      for (const field of ['title', 'description'] as const) {
        if (doc[field] !== undefined) {
          update[field] = doc[field];
        }
      }

      if (doc.propertiesData !== undefined) {
        update.propertiesData = await scopePropertiesData(
          models,
          entity.typeId,
          doc.propertiesData,
          entity.propertiesData,
        );
      }

      const unset: Record<string, 1> = {};

      if (doc.code !== undefined) {
        if (doc.code) {
          update.code = doc.code;
        } else {
          unset.code = 1;
        }
      }

      await models.StructureEntities.updateOne(
        { _id },
        {
          $set: update,
          ...(Object.keys(unset).length ? { $unset: unset } : {}),
        },
      );

      return models.StructureEntities.getEntity(_id);
    }

    public static async setPropertyValues(
      _id: string,
      values: Record<string, unknown>,
    ) {
      await models.StructureEntities.getEntity(_id);

      const $set: Record<string, unknown> = {};
      const $unset: Record<string, ''> = {};

      for (const [fieldId, value] of Object.entries(values)) {
        if (value === null) {
          $unset[`propertiesData.${fieldId}`] = '';
        } else {
          $set[`propertiesData.${fieldId}`] = value;
        }
      }

      await withoutPermissionScope(() =>
        models.StructureEntities.updateOne({ _id }, { $set, $unset }),
      );

      return models.StructureEntities.getEntity(_id);
    }

    public static async changeType(
      _id: string,
      typeId: string,
      userId: string,
    ) {
      const entity = await models.StructureEntities.getEntity(_id);

      if (!entity.parentId) {
        throw new Error('The organization type cannot be changed');
      }

      if (entity.typeId === typeId) {
        return entity;
      }

      const type = await models.StructureEntityTypes.getType(typeId);

      if (type.isSystem) {
        throw new Error('Only the root uses the organization type');
      }

      const parent = await withoutPermissionScope(() =>
        models.StructureEntities.getEntity(entity.parentId || ''),
      );

      assertParentAllowed(type, parent);

      const children = await withoutPermissionScope(() =>
        models.StructureEntities.find(
          { parentId: _id, status: STRUCTURE_ENTITY_STATUSES.ACTIVE },
          { typeId: 1 },
        ).lean(),
      );
      const childTypes = await models.StructureEntityTypes.find({
        _id: { $in: [...new Set(children.map((child) => child.typeId))] },
      }).lean();
      const blocked = childTypes.find(
        (childType) =>
          (childType.parentTypeIds || []).length &&
          !(childType.parentTypeIds || []).includes(typeId),
      );

      if (blocked) {
        throw new Error(
          `${blocked.name} nodes inside cannot be placed under ${type.name}`,
        );
      }

      await models.StructureEntities.updateOne(
        { _id },
        { $set: { typeId, updatedBy: userId } },
      );

      return models.StructureEntities.getEntity(_id);
    }

    public static async moveEntity(
      _id: string,
      parentId: string,
      userId: string,
    ) {
      const entity = await models.StructureEntities.getEntity(_id);

      if (!entity.parentId) {
        throw new Error('The root cannot be moved');
      }

      const parent = await models.StructureEntities.getEntity(parentId);

      if (parent.order.startsWith(entity.order)) {
        throw new Error('A node cannot be moved under itself');
      }

      const type = await models.StructureEntityTypes.getType(entity.typeId);

      assertParentAllowed(type, parent);

      const order = `${parent.order}${entity._id}/`;
      const descendants = await withoutPermissionScope(() =>
        models.StructureEntities.find(
          { order: { $regex: new RegExp(`^${escapeRegExp(entity.order)}`) } },
          { order: 1 },
        ).lean(),
      );

      await models.StructureEntities.bulkWrite(
        descendants.map((node) => ({
          updateOne: {
            filter: { _id: node._id },
            update: {
              $set: { order: node.order.replace(entity.order, order) },
            },
          },
        })),
      );

      await models.StructureEntities.updateOne(
        { _id },
        { $set: { parentId: parent._id, updatedBy: userId } },
      );

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureEntities.getEntity(_id);
    }

    public static async archiveEntity(_id: string, userId: string) {
      const entity = await models.StructureEntities.getEntity(_id);

      if (!entity.parentId) {
        throw new Error('The root cannot be archived');
      }

      const activeChildren = await withoutPermissionScope(() =>
        models.StructureEntities.countDocuments({
          parentId: _id,
          status: STRUCTURE_ENTITY_STATUSES.ACTIVE,
        }),
      );

      if (activeChildren) {
        throw new Error('Move or archive the child nodes first');
      }

      const now = new Date();
      const memberships = await models.StructureEntityMembers.find({
        entityId: _id,
        ...activeMembershipFilter(now),
      });

      for (const membership of memberships) {
        await models.StructureEntityMembers.endMember(
          membership._id,
          userId,
          now,
        );
      }

      await models.StructureEntities.updateOne(
        { _id },
        {
          $set: {
            status: STRUCTURE_ENTITY_STATUSES.ARCHIVED,
            archivedAt: now,
            archivedBy: userId,
          },
        },
      );

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureEntities.getEntity(_id);
    }

    public static async restoreEntity(_id: string, userId: string) {
      const entity = await models.StructureEntities.getEntity(_id);

      if (entity.parentId) {
        const parent = await withoutPermissionScope(() =>
          models.StructureEntities.getEntity(entity.parentId || ''),
        );

        if (parent.status !== STRUCTURE_ENTITY_STATUSES.ACTIVE) {
          throw new Error('Restore the parent node first');
        }
      }

      await models.StructureEntities.updateOne(
        { _id },
        {
          $set: { status: STRUCTURE_ENTITY_STATUSES.ACTIVE, updatedBy: userId },
          $unset: { archivedAt: 1, archivedBy: 1 },
        },
      );

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureEntities.getEntity(_id);
    }
  }

  structureEntitySchema.loadClass(StructureEntity);

  return structureEntitySchema;
};

export const loadStructureEntityMemberClass = (
  models: IModels,
  subdomain: string,
) => {
  const assertSeats = async (entityId: string, seatIds: string[]) => {
    const entity = await models.StructureEntities.getEntity(entityId);

    if (entity.status !== STRUCTURE_ENTITY_STATUSES.ACTIVE) {
      throw new Error('Node is archived');
    }

    if (!seatIds.length) {
      return;
    }

    const found = await models.StructureSeats.countDocuments({
      _id: { $in: seatIds },
      entityId,
    });

    if (found !== seatIds.length) {
      throw new Error('Seats must belong to the membership node');
    }
  };

  const findActiveMember = async (entityId: string, userId: string) => {
    const member = await models.StructureEntityMembers.findOne({
      entityId,
      userId,
      ...activeMembershipFilter(),
    });

    if (!member) {
      throw new Error('Membership not found');
    }

    return member;
  };

  const setPrimary = async (userId: string, memberId: string) => {
    await models.StructureEntityMembers.updateMany(
      { userId, _id: { $ne: memberId }, isPrimary: true },
      { $set: { isPrimary: false } },
    );
    await models.StructureEntityMembers.updateOne(
      { _id: memberId },
      { $set: { isPrimary: true } },
    );
  };

  class StructureEntityMember {
    public static async getMember(_id: string) {
      const member = await models.StructureEntityMembers.findOne({ _id });

      if (!member) {
        throw new Error('Membership not found');
      }

      return member;
    }

    public static async addMember(
      doc: IStructureEntityMemberInput,
      actorId: string,
    ) {
      const seatIds = [...new Set(doc.seatIds || [])];

      await assertSeats(doc.entityId, seatIds);

      const existing = await models.StructureEntityMembers.exists({
        entityId: doc.entityId,
        userId: doc.userId,
        ...activeMembershipFilter(),
      });

      if (existing) {
        throw new Error('User is already a member of this node');
      }

      const hasPrimary = await models.StructureEntityMembers.exists({
        userId: doc.userId,
        isPrimary: true,
        ...activeMembershipFilter(),
      });

      const member = await models.StructureEntityMembers.create({
        entityId: doc.entityId,
        userId: doc.userId,
        seatIds,
        startsAt: doc.startsAt || new Date(),
        endsAt: doc.endsAt,
        isPrimary: false,
        createdBy: actorId,
      });

      if (doc.isPrimary || !hasPrimary) {
        await setPrimary(doc.userId, member._id);
      }

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureEntityMembers.getMember(member._id);
    }

    public static async updateMember(
      _id: string,
      doc: Partial<Pick<IStructureEntityMember, 'isPrimary' | 'endsAt'>>,
      actorId: string,
    ) {
      const member = await models.StructureEntityMembers.getMember(_id);
      const update: Record<string, unknown> = {};

      if (doc.endsAt !== undefined) {
        update.endsAt = doc.endsAt;
        update.endedBy = actorId;
      }

      if (Object.keys(update).length) {
        await models.StructureEntityMembers.updateOne(
          { _id },
          { $set: update },
        );
      }

      if (doc.isPrimary) {
        await setPrimary(member.userId, _id);
      }

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureEntityMembers.getMember(_id);
    }

    public static async addSeat(
      entityId: string,
      userId: string,
      seatId: string,
      actorId: string,
    ) {
      const existing = await models.StructureEntityMembers.findOne({
        entityId,
        userId,
        ...activeMembershipFilter(),
      });

      if (!existing) {
        return models.StructureEntityMembers.addMember(
          { entityId, userId, seatIds: [seatId] },
          actorId,
        );
      }

      await models.StructureEntityMembers.updateOne(
        { _id: existing._id },
        { $addToSet: { seatIds: seatId } },
      );

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureEntityMembers.getMember(existing._id);
    }

    public static async removeSeat(
      entityId: string,
      userId: string,
      seatId: string,
    ) {
      const member = await findActiveMember(entityId, userId);

      await models.StructureEntityMembers.updateOne(
        { _id: member._id },
        { $pull: { seatIds: seatId } },
      );

      await bumpPermissionCacheVersion(subdomain);
    }

    public static async endMember(_id: string, actorId: string, endsAt?: Date) {
      const member = await models.StructureEntityMembers.getMember(_id);

      await models.StructureEntityMembers.updateOne(
        { _id },
        {
          $set: {
            endsAt: endsAt || new Date(),
            endedBy: actorId,
            isPrimary: false,
          },
        },
      );

      if (member.isPrimary) {
        const next = await models.StructureEntityMembers.findOne({
          userId: member.userId,
          _id: { $ne: _id },
          ...activeMembershipFilter(),
        }).sort({ startsAt: 1 });

        if (next) {
          await setPrimary(member.userId, next._id);
        }
      }

      await bumpPermissionCacheVersion(subdomain);

      return models.StructureEntityMembers.getMember(_id);
    }
  }

  structureEntityMemberSchema.loadClass(StructureEntityMember);

  return structureEntityMemberSchema;
};
