import * as crypto from 'crypto';
import { Document, ObjectId } from 'mongoose';
import { nanoid } from 'nanoid';

export class TemplateManager {
  private EXCLUDE_FIELDS_MAP?: Record<string, string[]>;
  private INCLUDE_FEILDS?: Record<string, unknown>;

  constructor(
    EXCLUDE_FIELDS_MAP?: Record<string, string[]>,
    INCLUDE_FEILDS?: Record<string, unknown>,
  ) {
    this.EXCLUDE_FIELDS_MAP = EXCLUDE_FIELDS_MAP;
    this.INCLUDE_FEILDS = INCLUDE_FEILDS;
  }

  public generateIdentity(): string {
    return nanoid();
  }

  private generateHash(doc: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(doc))
      .digest('hex')
      .slice(0, 8);
  }

  public getContent(
    collections: Record<string, any[]>,
  ): Record<string, Record<string, any[]>> {
    try {
      const hashMap: Record<string, string> = {};

      if (!Object.keys(collections || {})?.length) return {};

      for (const documents of Object.values(collections)) {
        for (const document of documents) {
          hashMap[String(document._id)] = this.generateHash(document);
        }
      }

      const content: Record<string, Record<string, any>> = {};

      for (const [collection, documents] of Object.entries(collections)) {
        const EXCLUDE_FIELDS = this.EXCLUDE_FIELDS_MAP?.[collection] || [];

        if (!content[collection]) {
          content[collection] = {};
        }

        for (const document of documents) {
          const hash = hashMap[String(document._id)];

          for (const key of Object.keys(document) as string[]) {
            const value = document[key];

            if (EXCLUDE_FIELDS.includes(key)) {
              delete document[key];

              continue;
            }

            if (!hashMap[String(value)]) continue;

            document[key] = hashMap[String(value)];
          }

          content[collection][hash] = document;
        }
      }

      return content;
    } catch (error) {
      throw new Error(error)
    }
  }

  public setContent(collections: Record<string, Record<string, any>>) {
    try {
      const identityMap: Record<string, string | ObjectId> = {};

      const contents: Record<string, any[]> = {}

      for (const [collection, documents] of Object.entries(collections)) {
        contents[collection] = [] 

        for (const [hash, fields] of Object.entries(documents)) {
          identityMap[String(hash)] = this.generateIdentity();

          const document: any = { ...fields, _id: identityMap[hash] };

          if (Object.keys(this.INCLUDE_FEILDS || {}).length) {
            Object.assign(document, this.INCLUDE_FEILDS);
          }

          for (const key of Object.keys(document)) {
            const value = document[key];

            if (key === 'code') {
              document[key] = this.generateIdentity();
            }

            if (!identityMap[String(value)]) continue;

            document[key] = identityMap[String(value)];
          }

          contents[collection].push(document);
        }
      }

      return contents;
    } catch (error) {
      throw new Error(error)
    }
  }
}
