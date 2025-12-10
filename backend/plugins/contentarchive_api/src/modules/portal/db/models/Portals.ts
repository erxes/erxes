import { Model } from 'mongoose';

import slugify from 'slugify';
import { IPortalDocument } from '@/portal/@types/portal';
import { IModels } from '~/connectionResolvers';
import { IPortal } from '@/portal/@types/portal';
import { portalSchema } from '@/portal/db/definitions/portal';
import {
  removeExtraSpaces,
  removeLastTrailingSlash,
} from 'erxes-api-shared/utils';

export interface IPortalModel extends Model<IPortalDocument> {
  /**
   * Retrieves a portal configuration by a given ID
   *
   * @param _id - The ID of the portal configuration to retrieve
   * @returns The portal configuration associated with the given ID
   */
  getConfig(_id: string): Promise<IPortalDocument>;

  /**
   * Creates or updates a portal configuration with the given properties
   *
   * @param args - The properties of the portal configuration to create or update
   * @returns The updated portal configuration
   */
  createOrUpdateConfig(args: IPortal): Promise<IPortalDocument>;
}

/**
 * Loads the Client Portal class, defining the methods to interact with
 * portal configurations in the database. The class includes methods for
 * retrieving and creating/updating portal configurations based on a given
 * portal ID. It integrates with the provided models to perform database
 * operations and ensures proper formatting of portal URLs and slugs.
 *
 * @param models - The database models used for interacting with portal data.
 * @returns The portal schema with the loaded Portal class.
 */

export const loadPortalClass = (models: IModels) => {
  class Portal {
    public static async getConfig(_id: string) {
      const config = await models.Portals.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async createOrUpdateConfig({ _id, ...doc }: IPortal) {
      let config = await models.Portals.findOne({ _id });

      if (doc.url) {
        doc.url = removeExtraSpaces(removeLastTrailingSlash(doc.url));
      }

      if (!doc.slug && doc.name) {
        doc.slug = slugify(doc.name, { lower: true });
      }

      if (!config) {
        config = await models.Portals.create(doc);

        return config.toJSON();
      }

      await models.Portals.findOneAndUpdate(
        { _id: config._id },
        { $set: doc },
        { new: true },
      );

      return models.Portals.findOne({ _id: config._id });
    }
  }

  portalSchema.loadClass(Portal);

  return portalSchema;
};
