import { isEmail } from '@/auth/utils';
import type { IDetail } from 'erxes-api-shared/core-types';
import type { PipelineStage } from 'mongoose';

export interface IProfilePatch {
  username?: string;
  email?: string;
  details?: {
    [Key in Exclude<keyof IDetail, 'fullName'>]?: IDetail[Key] | null;
  } & { employeeId?: string | null };
  links?: Record<string, string | null>;
  positionIds?: string[];
}

const DETAIL_FIELDS = new Set([
  'avatar',
  'coverPhoto',
  'shortName',
  'position',
  'birthDate',
  'workStartedDate',
  'location',
  'description',
  'operatorPhone',
  'firstName',
  'middleName',
  'lastName',
  'employeeId',
]);

const buildProfileIdentityFields = (
  patch: IProfilePatch,
): Record<string, unknown> => {
  const fields: Record<string, unknown> = {};

  if (patch.username !== undefined) {
    if (
      typeof patch.username !== 'string' ||
      patch.username.trim().length < 3
    ) {
      throw new Error('Username must be at least 3 characters');
    }
    fields.username = { $literal: patch.username.trim() };
  }
  if (patch.email !== undefined) {
    if (typeof patch.email !== 'string' || !isEmail(patch.email.trim())) {
      throw new Error('Email must be a valid email');
    }
    fields.email = { $literal: patch.email.trim().toLowerCase() };
  }

  return fields;
};

const assertProfileDetail = (key: string, value: unknown): void => {
  if (!DETAIL_FIELDS.has(key)) throw new Error(`Invalid profile field: ${key}`);
  const isDate = key === 'birthDate' || key === 'workStartedDate';
  if (
    value !== null &&
    (isDate
      ? !(value instanceof Date) || Number.isNaN(value.getTime())
      : typeof value !== 'string')
  ) {
    throw new Error(`Invalid value for profile field: ${key}`);
  }
};

const normalizeProfileDetails = (
  details: IProfilePatch['details'],
): IProfilePatch['details'] => {
  if (details === undefined) return undefined;
  if (!details || Array.isArray(details)) {
    throw new Error('Profile details must be an object');
  }
  for (const [key, value] of Object.entries(details)) {
    assertProfileDetail(key, value);
  }
  if (Object.keys(details).length === 0) return undefined;

  // Aggregation updates bypass the operatorPhone schema setter.
  return {
    ...details,
    ...(typeof details.operatorPhone === 'string' && {
      operatorPhone: details.operatorPhone.replace(/\D/g, ''),
    }),
  };
};

const normalizeProfileLinks = (
  links: IProfilePatch['links'],
): Record<string, string> | undefined => {
  if (links === undefined) return undefined;
  if (!links || Array.isArray(links) || typeof links !== 'object') {
    throw new Error('Profile links must be an object');
  }
  for (const [key, value] of Object.entries(links)) {
    if (
      !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key) ||
      ['constructor', 'prototype', '__proto__'].includes(key) ||
      (value !== null && typeof value !== 'string')
    ) {
      throw new Error('Profile links contain an invalid key or value');
    }
  }
  if (Object.keys(links).length === 0) return undefined;

  return Object.fromEntries(
    Object.entries(links).map(([key, value]): [string, string] => [
      key,
      value ?? '',
    ]),
  );
};

const assertProfilePositionIds = (positionIds: string[]): void => {
  if (
    !Array.isArray(positionIds) ||
    positionIds.some((id) => typeof id !== 'string' || !id)
  ) {
    throw new Error('Positions must be a list of position IDs');
  }
};

export const buildProfilePatch = (patch: IProfilePatch): PipelineStage[] => {
  const fields = buildProfileIdentityFields(patch);
  const details = normalizeProfileDetails(patch.details);
  if (details) {
    fields.details = {
      $mergeObjects: [{ $ifNull: ['$details', {}] }, { $literal: details }],
    };
  }
  const links = normalizeProfileLinks(patch.links);
  if (links) {
    fields.links = {
      $mergeObjects: [{ $ifNull: ['$links', {}] }, { $literal: links }],
    };
  }

  if (patch.positionIds !== undefined) {
    assertProfilePositionIds(patch.positionIds);
    fields.positionIds = { $literal: patch.positionIds };
  }

  if (Object.keys(fields).length === 0)
    throw new Error('No profile changes supplied');

  const pipeline: PipelineStage[] = [{ $set: fields }];
  if (
    patch.details &&
    ('firstName' in patch.details || 'lastName' in patch.details)
  ) {
    pipeline.push({
      $set: {
        'details.fullName': {
          $concat: [
            { $ifNull: ['$details.firstName', ''] },
            ' ',
            { $ifNull: ['$details.lastName', ''] },
          ],
        },
      },
    });
  }
  return pipeline;
};
