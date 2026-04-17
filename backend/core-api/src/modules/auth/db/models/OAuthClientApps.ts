import crypto from 'crypto';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IOAuthClientAppDocument,
  OAuthClientAppType,
  oauthClientAppSchema,
} from '@/auth/db/definitions/oauthClientApps';

type OAuthClientAppDoc = {
  name: string;
  logo?: string;
  description?: string;
  redirectUrls?: string[];
  type: OAuthClientAppType;
};

const normalizeRedirectUrls = (redirectUrls?: string[]) => {
  return [
    ...new Set((redirectUrls || []).map((url) => url.trim()).filter(Boolean)),
  ];
};

const slugifyClientName = (name: string) => {
  const normalized = (name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'oauth-client';
};

const generateClientId = () => {
  return crypto.randomBytes(3).toString('hex');
};

const generateSecret = () => {
  return `ocs_${crypto.randomBytes(24).toString('hex')}`;
};

const hashSecret = (secret: string) => {
  return crypto.createHash('sha256').update(secret).digest('hex');
};

export interface IOAuthClientAppModel extends Model<IOAuthClientAppDocument> {
  getOAuthClientApp(_id: string): Promise<IOAuthClientAppDocument>;
  createOAuthClientApp(doc: OAuthClientAppDoc): Promise<any>;
  updateOAuthClientApp(_id: string, doc: OAuthClientAppDoc): Promise<any>;
  revokeOAuthClientApp(_id: string): Promise<IOAuthClientAppDocument>;
  removeOAuthClientApp(_id: string): Promise<any>;
}

export const loadOAuthClientAppClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class OAuthClientApp {
    public static async getOAuthClientApp(_id: string) {
      const oauthClientApp = await models.OAuthClientApps.findOne({ _id });

      if (!oauthClientApp) {
        throw new Error('OAuth client app not found');
      }

      return oauthClientApp;
    }

    public static async createOAuthClientApp(doc: OAuthClientAppDoc) {
      const normalizedName = doc.name.trim();
      const redirectUrls = normalizeRedirectUrls(doc.redirectUrls);
      const secret = doc.type === 'confidential' ? generateSecret() : undefined;

      let clientId = '';

      for (let attempt = 0; attempt < 5; attempt++) {
        const nextClientId = `${slugifyClientName(
          normalizedName,
        )}-${generateClientId()}`;
        const existing = await models.OAuthClientApps.findOne({
          clientId: nextClientId,
        }).lean();

        if (!existing) {
          clientId = nextClientId;
          break;
        }
      }

      if (!clientId) {
        throw new Error('Could not generate unique client id');
      }

      const oauthClientApp = await models.OAuthClientApps.create({
        name: normalizedName,
        logo: doc.logo?.trim() || undefined,
        description: doc.description?.trim() || undefined,
        clientId,
        type: doc.type,
        redirectUrls,
        secretHash: secret ? hashSecret(secret) : undefined,
        status: 'active',
      });

      sendDbEventLog({
        action: 'create',
        docId: String(oauthClientApp._id),
        currentDocument: oauthClientApp.toObject(),
      });

      return {
        ...oauthClientApp.toObject(),
        generatedSecret: secret,
      };
    }

    public static async updateOAuthClientApp(
      _id: string,
      doc: OAuthClientAppDoc,
    ) {
      const existing = await models.OAuthClientApps.getOAuthClientApp(_id);

      const nextType = doc.type;
      const nextSecret =
        nextType === 'confidential' && !existing.secretHash
          ? generateSecret()
          : undefined;

      const updateDoc = {
        name: doc.name.trim(),
        logo: doc.logo?.trim() || undefined,
        description: doc.description?.trim() || undefined,
        type: nextType,
        redirectUrls: normalizeRedirectUrls(doc.redirectUrls),
      };
      const updateOperation: Record<string, any> = {
        $set: updateDoc,
      };

      const unsetFields: Record<string, 1> = {};

      if (!updateDoc.logo) {
        unsetFields.logo = 1;
      }

      if (!updateDoc.description) {
        unsetFields.description = 1;
      }

      if (nextType === 'public') {
        unsetFields.secretHash = 1;
      } else if (nextSecret) {
        updateOperation.$set.secretHash = hashSecret(nextSecret);
      }

      if (Object.keys(unsetFields).length) {
        updateOperation.$unset = unsetFields;
      }

      await models.OAuthClientApps.updateOne({ _id }, updateOperation);

      const updated = await models.OAuthClientApps.findOne({ _id });

      if (!updated) {
        throw new Error('OAuth client app not found');
      }

      sendDbEventLog({
        action: 'update',
        docId: String(updated._id),
        currentDocument: updated.toObject(),
        prevDocument: existing.toObject(),
      });

      return {
        ...updated.toObject(),
        generatedSecret: nextSecret,
      };
    }

    public static async revokeOAuthClientApp(_id: string) {
      const existing = await models.OAuthClientApps.getOAuthClientApp(_id);

      await models.OAuthClientApps.updateOne(
        { _id },
        { $set: { status: 'revoked' } },
      );

      const updated = await models.OAuthClientApps.findOne({ _id });

      if (!updated) {
        throw new Error('OAuth client app not found');
      }

      sendDbEventLog({
        action: 'update',
        docId: String(updated._id),
        currentDocument: updated.toObject(),
        prevDocument: existing.toObject(),
      });

      return updated;
    }

    public static async removeOAuthClientApp(_id: string) {
      const existing = await models.OAuthClientApps.getOAuthClientApp(_id);

      sendDbEventLog({
        action: 'delete',
        docId: String(existing._id),
      });

      return models.OAuthClientApps.deleteOne({ _id });
    }
  }

  oauthClientAppSchema.loadClass(OAuthClientApp);

  return oauthClientAppSchema;
};
