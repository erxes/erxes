import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import sha256 from 'sha256';
import { IModels } from '~/connectionResolvers';
import { cpUserSchema } from 'erxes-api-shared/core-modules';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { SALT_WORK_FACTOR } from '../../constants';

export interface ICPUserModel extends Model<ICPUserDocument> {
  generatePassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): Promise<boolean>;
}

export const loadCPUserClass = (models: IModels) => {
  class CPUser {
    public static async comparePassword(
      password: string,
      userPassword: string,
    ): Promise<boolean> {
      const hashPassword = sha256(password);
      return bcrypt.compare(hashPassword, userPassword);
    }

    public static async generatePassword(password: string): Promise<string> {
      const hashPassword = sha256(password);
      return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
    }
  }

  cpUserSchema.loadClass(CPUser);

  return cpUserSchema;
};
