import * as crypto from 'crypto';
import { Document, ObjectId } from 'mongoose';
import { nanoid } from 'nanoid';

export class TemplateManager<T extends Document> {
  private EXCLUDE_FIELDS: (keyof T)[];
  private INCLUDE_FEILDS?: Record<string, unknown>;

  constructor(EXCLUDE_FIELDS: (keyof T)[] = [], INCLUDE_FEILDS?: Record<string, unknown>) {
    this.EXCLUDE_FIELDS = EXCLUDE_FIELDS;
    this.INCLUDE_FEILDS = INCLUDE_FEILDS
  }

  public generateIdentity(): string {
    return nanoid()
  }

  private generateHash(doc: T): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(doc))
      .digest('hex')
      .slice(0, 8);
  }

  public getContent(documents: T[]): Record<string, T> {
    const hashMap: Record<string, string> = {};

    if (!documents?.length) return {};

    for (const document of documents) {
      hashMap[String(document._id)] = this.generateHash(document);
    }

    const content: Record<string, T> = {};

    for (const document of documents) {
      const hash = hashMap[String(document._id)];

      for (const key of Object.keys(document) as (keyof T)[]) {
        const value = document[key];

        if (this.EXCLUDE_FIELDS.includes(key)) {
          delete document[key];
          
          continue;
        }

        if (!hashMap[String(value)]) continue;

        document[key] = hashMap[String(value)] as T[keyof T];
      }

      content[hash] = document;
    }

    return content;
  }

  public setContent(content: Record<string, T>) {
    const identityMap: Record<string, string | ObjectId> = {};

    const documents: Array<T> = []
    
    for (const [hash, fields] of Object.entries(content)) {
      identityMap[String(hash)] = this.generateIdentity();

      const document: T = { ...fields, _id: identityMap[hash] }

      if (Object.keys(this.INCLUDE_FEILDS || {}).length) {
        Object.assign(document, this.INCLUDE_FEILDS)
      }

      for (const key of Object.keys(document) as (keyof T)[]) {
        const value = document[key];

        if (key === 'code') {
          document[key] = this.generateIdentity() as T[keyof T];
        }

        if (!identityMap[String(value)]) continue;

        document[key] = identityMap[String(value)] as T[keyof T];
      }

      documents.push(document)
    }

    return documents
  }
}