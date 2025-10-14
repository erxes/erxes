import {
    IRole,
    IRoleDocument,
    IUserDocument,
} from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { PERMISSION_ROLES } from '~/modules/permissions/db/constants';
import { roleSchema } from '../definitions/roles';
  
  export interface IRoleModel extends Model<IRoleDocument> {
    getRole(userId: string): Promise<IRoleDocument>;
    createRole(doc: IRole, user: IUserDocument): Promise<IRoleDocument>;
    updateRole(doc: IRole, user: IUserDocument): Promise<IRoleDocument>;
  }
  
  export const loadRoleClass = (models: IModels) => {
    class Role {
      public static async validateRole(doc: IRole, user: IUserDocument) {
        const { userId, role } = doc || {};
  
        if (!PERMISSION_ROLES.ALL.includes(role)) {
          throw new Error('Invalid role');
        }
  
        const userRole = await models.Roles.findOne({
          userId: user._id,
        }).lean();
  
        if (!userRole) {
          throw new Error('Role not found for user.');
        }
  
        if (userRole.role === PERMISSION_ROLES.OWNER) {
          if (role === PERMISSION_ROLES.OWNER) {
            throw new Error('Access denied');
          }
  
          return;
        }
  
        if (userRole.role === PERMISSION_ROLES.MEMBER) {
          throw new Error('Access denied');
        }
  
        if (userRole.role === PERMISSION_ROLES.ADMIN) {
          const isOwner = await models.Roles.findOne({
            userId,
            role: PERMISSION_ROLES.OWNER,
          }).lean();
  
          if (isOwner) {
            throw new Error('Access denied');
          }
  
          const isMember = await models.Roles.findOne({
            userId,
            role: PERMISSION_ROLES.MEMBER,
          }).lean();
  
          if (isMember && role === PERMISSION_ROLES.OWNER) {
            throw new Error('Access denied');
          }
        }
      }
  
      public static async getRole(userId: string) {
        const role = await models.Roles.findOne({ userId }).lean();
  
        if (!role) {
          const user = await models.Users.getUser(userId);
  
          const userRole = {
            userId,
            role: PERMISSION_ROLES.MEMBER,
          };
  
          if (user.isOwner) {
            userRole.role = PERMISSION_ROLES.OWNER;
          }
  
          return await models.Roles.create(userRole);
        }
  
        return role;
      }
  
      public static async createRole(doc: IRole, user: IUserDocument) {
        await this.validateRole(doc, user);
  
        const { userId } = doc;
  
        const role = await models.Roles.findOne({ userId }).lean();
  
        if (role) {
          throw new Error('Role already exists');
        }
  
        return await models.Roles.create(doc);
      }
  
      public static async updateRole(doc: IRole, user: IUserDocument) {
        await this.validateRole(doc, user);
  
        const { userId } = doc;
  
        return await models.Roles.findOneAndUpdate({ userId }, doc, {
          new: true,
        });
      }
    }
  
    roleSchema.loadClass(Role);
  
    return roleSchema;
  };