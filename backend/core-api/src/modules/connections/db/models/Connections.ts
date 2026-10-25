import { IConnectionTypeDescriptor } from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  IConnection,
  IConnectionAddInput,
  IConnectionDocument,
  IConnectionEditInput,
  TConnectionTestStatus,
} from '@/connections/@types/connection';
import {
  CONNECTION_NAME_COLLATION,
  connectionSchema,
} from '@/connections/db/definitions/connection';
import {
  buildConnectionFields,
  normalizeConnectionAppearance,
  normalizeConnectionName,
} from '@/connections/validation';

export interface IConnectionModel extends Model<IConnectionDocument> {
  getConnection(_id: string): Promise<IConnectionDocument>;
  findByName(name: string, type?: string): Promise<IConnectionDocument | null>;
  createConnection(
    input: IConnectionAddInput,
    descriptor: IConnectionTypeDescriptor,
    userId?: string,
  ): Promise<IConnectionDocument>;
  updateConnection(
    _id: string,
    input: IConnectionEditInput,
    descriptor: IConnectionTypeDescriptor | undefined,
    userId?: string,
  ): Promise<IConnectionDocument>;
  removeConnection(_id: string): Promise<IConnectionDocument>;
  recordTestResult(
    _id: string,
    status: TConnectionTestStatus,
    message?: string,
  ): Promise<IConnectionDocument | null>;
}

const isDuplicateKey = (error: unknown) =>
  (error as { code?: number })?.code === 11000;

const duplicateName = () =>
  new ExpectedError('A connection with this name already exists', 'BAD_USER_INPUT');

export const loadConnectionClass = (models: IModels) => {
  class Connection {
    public static async getConnection(_id: string) {
      const connection = await models.Connections.findOne({ _id });

      if (!connection) {
        throw new ExpectedError('Connection not found', 'NOT_FOUND');
      }

      return connection;
    }

    public static async findByName(name: string, type?: string) {
      return models.Connections.findOne({
        name: name.trim(),
        ...(type ? { type } : {}),
      }).collation(CONNECTION_NAME_COLLATION);
    }

    public static async createConnection(
      input: IConnectionAddInput,
      descriptor: IConnectionTypeDescriptor,
      userId?: string,
    ) {
      // The id is chosen first: sealed values are bound to it.
      const _id = nanoid();
      const doc: IConnection & { _id: string } = {
        _id,
        name: normalizeConnectionName(input.name),
        ...normalizeConnectionAppearance(input.icon, input.logo),
        type: descriptor.id,
        fields: buildConnectionFields({
          descriptor,
          connectionId: _id,
          inputs: input.fields || [],
        }),
        createdBy: userId,
        updatedBy: userId,
      };

      try {
        return await models.Connections.create(doc);
      } catch (error) {
        if (isDuplicateKey(error)) {
          throw duplicateName();
        }

        throw error;
      }
    }

    public static async updateConnection(
      _id: string,
      input: IConnectionEditInput,
      descriptor: IConnectionTypeDescriptor | undefined,
      userId?: string,
    ) {
      const connection = await models.Connections.getConnection(_id);
      const $set: Partial<IConnection> = { updatedBy: userId };
      const $unset: Record<string, 1> = {};

      if (input.name !== undefined) {
        $set.name = normalizeConnectionName(input.name);
      }

      if (input.icon !== undefined || input.logo !== undefined) {
        const appearance = normalizeConnectionAppearance(
          input.icon === undefined ? connection.icon : input.icon,
          input.logo === undefined ? connection.logo : input.logo,
        );

        for (const key of ['icon', 'logo'] as const) {
          if (appearance[key]) {
            $set[key] = appearance[key];
          } else {
            $unset[key] = 1;
          }
        }
      }

      if (input.fields) {
        if (!descriptor) {
          throw new ExpectedError(
            'This connection type is not available, so its fields cannot be edited',
            'BAD_USER_INPUT',
          );
        }

        $set.fields = buildConnectionFields({
          descriptor,
          connectionId: connection._id,
          inputs: input.fields,
          existing: connection.fields,
        });
        // A new value is untested.
        $unset.lastTestedAt = 1;
        $unset.lastTestStatus = 1;
        $unset.lastTestMessage = 1;
      }

      try {
        const updated = await models.Connections.findOneAndUpdate(
          { _id },
          { $set, ...(Object.keys($unset).length ? { $unset } : {}) },
          { new: true },
        );

        if (!updated) {
          throw new ExpectedError('Connection not found', 'NOT_FOUND');
        }

        return updated;
      } catch (error) {
        if (isDuplicateKey(error)) {
          throw duplicateName();
        }

        throw error;
      }
    }

    public static async removeConnection(_id: string) {
      const connection = await models.Connections.getConnection(_id);

      await models.Connections.deleteOne({ _id });

      return connection;
    }

    public static async recordTestResult(
      _id: string,
      status: TConnectionTestStatus,
      message?: string,
    ) {
      return models.Connections.findOneAndUpdate(
        { _id },
        {
          $set: {
            lastTestedAt: new Date(),
            lastTestStatus: status,
            ...(message ? { lastTestMessage: message } : {}),
          },
          ...(message ? {} : { $unset: { lastTestMessage: 1 } }),
        },
        { new: true },
      );
    }
  }

  connectionSchema.loadClass(Connection);

  return connectionSchema;
};
